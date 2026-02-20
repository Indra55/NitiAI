const express = require("express");
const router = express.Router();
const pool = require("../config/dbConfig");
const { authenticateToken } = require("../middleware/auth");
const { generateRoadmap } = require("../services/roadmapService");

/**
 * @route POST /api/planner/generate-roadmap
 * @desc Generate AI-powered personalized roadmap
 * @access Private
 */
router.post("/generate-roadmap", authenticateToken, async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            // Fetch user profile data
            const userResult = await client.query(
                `SELECT name, career_goal_short, proficiency_level FROM users WHERE id = $1`,
                [req.user.id]
            );

            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            const user = userResult.rows[0];

            // Fetch user skills
            const skillsResult = await client.query(
                `SELECT skill_name FROM skills WHERE user_id = $1`,
                [req.user.id]
            );
            const skills = skillsResult.rows.map(row => row.skill_name);

            // Fetch experience (calculate years)
            const expResult = await client.query(
                `SELECT start_date, end_date FROM experience WHERE user_id = $1 ORDER BY start_date DESC LIMIT 1`,
                [req.user.id]
            );

            let experienceYears = 0;
            if (expResult.rows.length > 0) {
                const startDate = new Date(expResult.rows[0].start_date);
                const endDate = expResult.rows[0].end_date ? new Date(expResult.rows[0].end_date) : new Date();
                experienceYears = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24 * 365));
            }

            // Generate roadmap using AI
            const roadmapData = await generateRoadmap({
                career_goal: user.career_goal_short,
                proficiency_level: user.proficiency_level,
                skills: skills,
                experience_years: experienceYears
            });

            // Begin transaction
            await client.query("BEGIN");

            // Check if user already has an active roadmap
            const existingRoadmap = await client.query(
                `SELECT id FROM career_roadmaps WHERE user_id = $1 AND status = 'active'`,
                [req.user.id]
            );

            // If exists, archive it
            if (existingRoadmap.rows.length > 0) {
                await client.query(
                    `UPDATE career_roadmaps SET status = 'archived' WHERE id = $1`,
                    [existingRoadmap.rows[0].id]
                );
            }

            // Create new roadmap
            const roadmapResult = await client.query(
                `INSERT INTO career_roadmaps (user_id, title, description, estimated_hours, status)
                 VALUES ($1, $2, $3, $4, 'active')
                 RETURNING id`,
                [req.user.id, roadmapData.title, roadmapData.description, roadmapData.estimated_total_hours]
            );

            const roadmapId = roadmapResult.rows[0].id;

            // Track global task index for dependencies
            let globalTaskIndex = 0;
            const taskIdsByIndex = {}; // Map from global index to database ID

            // Create milestones and tasks
            for (const milestone of roadmapData.milestones) {
                // Create milestone
                const milestoneResult = await client.query(
                    `INSERT INTO roadmap_milestones (roadmap_id, title, description, sequence_order)
                     VALUES ($1, $2, $3, $4)
                     RETURNING id`,
                    [roadmapId, milestone.title, milestone.description, milestone.sequence_order]
                );

                const milestoneId = milestoneResult.rows[0].id;

                // Create tasks for this milestone
                for (const task of milestone.tasks) {
                    const deadline = task.deadline_days_from_start
                        ? new Date(Date.now() + task.deadline_days_from_start * 24 * 60 * 60 * 1000)
                        : null;

                    const taskResult = await client.query(
                        `INSERT INTO roadmap_tasks 
                         (roadmap_id, milestone_id, title, description, category, priority, difficulty, 
                          estimated_hours, deadline, sequence_order, resources, status)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'todo')
                         RETURNING id`,
                        [
                            roadmapId,
                            milestoneId,
                            task.title,
                            task.description,
                            task.category,
                            task.priority,
                            task.difficulty,
                            task.estimated_hours,
                            deadline,
                            task.sequence_order,
                            task.resources || []
                        ]
                    );

                    const taskId = taskResult.rows[0].id;
                    taskIdsByIndex[globalTaskIndex] = taskId;

                    // Create dependencies
                    if (task.prerequisite_task_indices && task.prerequisite_task_indices.length > 0) {
                        for (const prereqIndex of task.prerequisite_task_indices) {
                            const prereqTaskId = taskIdsByIndex[prereqIndex];
                            if (prereqTaskId) {
                                await client.query(
                                    `INSERT INTO task_dependencies (task_id, depends_on_task_id)
                                     VALUES ($1, $2)
                                     ON CONFLICT DO NOTHING`,
                                    [taskId, prereqTaskId]
                                );
                            }
                        }
                    }

                    globalTaskIndex++;
                }
            }

            // Update roadmap task count
            await client.query(
                `UPDATE career_roadmaps SET total_tasks = $1 WHERE id = $2`,
                [globalTaskIndex, roadmapId]
            );

            await client.query("COMMIT");

            res.json({
                message: "Roadmap generated successfully",
                roadmap_id: roadmapId,
                title: roadmapData.title,
                total_tasks: globalTaskIndex
            });

        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Generate roadmap error:", error);
        res.status(500).json({ error: "Failed to generate roadmap" });
    }
});

/**
 * @route GET /api/planner/roadmap
 * @desc Get user's active roadmap with milestones
 * @access Private
 */
router.get("/roadmap", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, 
                    (SELECT COUNT(*) FROM roadmap_tasks WHERE roadmap_id = r.id) as total_tasks,
                    (SELECT COUNT(*) FROM roadmap_tasks WHERE roadmap_id = r.id AND status = 'completed') as completed_tasks
             FROM career_roadmaps r
             WHERE r.user_id = $1 AND r.status = 'active'
             ORDER BY r.created_at DESC
             LIMIT 1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.json({ roadmap: null });
        }

        const roadmap = result.rows[0];

        // Calculate progress
        const progress = roadmap.total_tasks > 0
            ? Math.round((roadmap.completed_tasks / roadmap.total_tasks) * 100)
            : 0;

        roadmap.progress_percentage = progress;

        // Update progress in database
        await pool.query(
            `UPDATE career_roadmaps SET progress_percentage = $1, completed_tasks = $2 WHERE id = $3`,
            [progress, roadmap.completed_tasks, roadmap.id]
        );

        res.json({ roadmap });
    } catch (error) {
        console.error("Get roadmap error:", error);
        res.status(500).json({ error: "Failed to fetch roadmap" });
    }
});

/**
 * @route GET /api/planner/milestones
 * @desc Get all milestones for active roadmap
 * @access Private
 */
router.get("/milestones", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT m.*,
                    (SELECT COUNT(*) FROM roadmap_tasks WHERE milestone_id = m.id) as total_tasks,
                    (SELECT COUNT(*) FROM roadmap_tasks WHERE milestone_id = m.id AND status = 'completed') as completed_tasks
             FROM roadmap_milestones m
             JOIN career_roadmaps r ON m.roadmap_id = r.id
             WHERE r.user_id = $1 AND r.status = 'active'
             ORDER BY m.sequence_order ASC`,
            [req.user.id]
        );

        const milestones = result.rows.map(m => ({
            ...m,
            progress_percentage: m.total_tasks > 0 ? Math.round((m.completed_tasks / m.total_tasks) * 100) : 0
        }));

        res.json({ milestones });
    } catch (error) {
        console.error("Get milestones error:", error);
        res.status(500).json({ error: "Failed to fetch milestones" });
    }
});

/**
 * @route GET /api/planner/tasks
 * @desc Get all tasks for active roadmap
 * @access Private
 */
router.get("/tasks", authenticateToken, async (req, res) => {
    try {
        const tasksResult = await pool.query(
            `SELECT t.*, m.title as milestone_title
             FROM roadmap_tasks t
             JOIN roadmap_milestones m ON t.milestone_id = m.id
             JOIN career_roadmaps r ON t.roadmap_id = r.id
             WHERE r.user_id = $1 AND r.status = 'active'
             ORDER BY t.sequence_order ASC`,
            [req.user.id]
        );

        const tasks = tasksResult.rows;

        // Fetch dependencies for each task
        for (const task of tasks) {
            const depsResult = await pool.query(
                `SELECT t2.id, t2.title, t2.status 
                 FROM task_dependencies td
                 JOIN roadmap_tasks t2 ON td.depends_on_task_id = t2.id
                 WHERE td.task_id = $1`,
                [task.id]
            );
            task.dependencies = depsResult.rows;

            // Determine if task is blocked
            const hasIncompleteDeps = task.dependencies.some(dep => dep.status !== 'completed');
            if (hasIncompleteDeps && task.status === 'todo') {
                task.is_blocked = true;
            } else {
                task.is_blocked = false;
            }
        }

        res.json({ tasks });
    } catch (error) {
        console.error("Get tasks error:", error);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

/**
 * @route PUT /api/planner/tasks/:id/move
 * @desc Move task to different status (Kanban drag-drop)
 * @access Private
 */
router.put("/tasks/:id/move", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'todo', 'in-progress', 'completed'

    try {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Verify task belongs to user
            const taskCheck = await client.query(
                `SELECT t.id, t.status, t.roadmap_id
                 FROM roadmap_tasks t
                 JOIN career_roadmaps r ON t.roadmap_id = r.id
                 WHERE t.id = $1 AND r.user_id = $2`,
                [id, req.user.id]
            );

            if (taskCheck.rows.length === 0) {
                return res.status(404).json({ error: "Task not found" });
            }

            const task = taskCheck.rows[0];

            // Check dependencies if moving to in-progress or completed
            if (status === 'in-progress' || status === 'completed') {
                const depsResult = await client.query(
                    `SELECT COUNT(*) as blocked_count
                     FROM task_dependencies td
                     JOIN roadmap_tasks t2 ON td.depends_on_task_id = t2.id
                     WHERE td.task_id = $1 AND t2.status != 'completed'`,
                    [id]
                );

                if (parseInt(depsResult.rows[0].blocked_count) > 0) {
                    return res.status(400).json({
                        error: "Cannot start task: Prerequisites not completed"
                    });
                }
            }

            // Update task status
            const updateFields = [status];
            let query = `UPDATE roadmap_tasks SET status = $1, updated_at = now()`;

            if (status === 'completed') {
                query += `, completed_at = now()`;
            }

            query += ` WHERE id = $2`;
            updateFields.push(id);

            await client.query(query, updateFields);

            await client.query("COMMIT");

            res.json({ message: "Task status updated", new_status: status });

        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Move task error:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
});

/**
 * @route PUT /api/planner/tasks/:id
 * @desc Update task details
 * @access Private
 */
router.put("/tasks/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, deadline, notes, actual_hours } = req.body;

    try {
        const result = await pool.query(
            `UPDATE roadmap_tasks t
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 priority = COALESCE($3, priority),
                 deadline = COALESCE($4, deadline),
                 notes = COALESCE($5, notes),
                 actual_hours = COALESCE($6, actual_hours),
                 updated_at = now()
             FROM career_roadmaps r
             WHERE t.roadmap_id = r.id AND t.id = $7 AND r.user_id = $8
             RETURNING t.*`,
            [title, description, priority, deadline, notes, actual_hours, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json({ message: "Task updated", task: result.rows[0] });
    } catch (error) {
        console.error("Update task error:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
});

/**
 * @route DELETE /api/planner/tasks/:id
 * @desc Delete a task
 * @access Private
 */
router.delete("/tasks/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM roadmap_tasks t
             USING career_roadmaps r
             WHERE t.roadmap_id = r.id AND t.id = $1 AND r.user_id = $2`,
            [id, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json({ message: "Task deleted" });
    } catch (error) {
        console.error("Delete task error:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

/**
 * @route GET /api/planner/dependencies
 * @desc Get dependency graph data
 * @access Private
 */
router.get("/dependencies", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT td.task_id, td.depends_on_task_id,
                    t1.title as task_title, t1.status as task_status,
                    t2.title as dependency_title, t2.status as dependency_status
             FROM task_dependencies td
             JOIN roadmap_tasks t1 ON td.task_id = t1.id
             JOIN roadmap_tasks t2 ON td.depends_on_task_id = t2.id
             JOIN career_roadmaps r ON t1.roadmap_id = r.id
             WHERE r.user_id = $1 AND r.status = 'active'`,
            [req.user.id]
        );

        res.json({ dependencies: result.rows });
    } catch (error) {
        console.error("Get dependencies error:", error);
        res.status(500).json({ error: "Failed to fetch dependencies" });
    }
});

/**
 * @route GET /api/planner/progress
 * @desc Get progress analytics
 * @access Private
 */
router.get("/progress", authenticateToken, async (req, res) => {
    try {
        const roadmapResult = await pool.query(
            `SELECT r.*,
                    (SELECT COUNT(*) FROM roadmap_tasks WHERE roadmap_id = r.id) as total_tasks,
                    (SELECT COUNT(*) FROM roadmap_tasks WHERE roadmap_id = r.id AND status = 'completed') as completed_tasks,
                    (SELECT COUNT(*) FROM roadmap_tasks WHERE roadmap_id = r.id AND status = 'in-progress') as in_progress_tasks,
                    (SELECT SUM(estimated_hours) FROM roadmap_tasks WHERE roadmap_id = r.id) as total_estimated_hours,
                    (SELECT SUM(actual_hours) FROM roadmap_tasks WHERE roadmap_id = r.id AND status = 'completed') as total_actual_hours
             FROM career_roadmaps r
             WHERE r.user_id = $1 AND r.status = 'active'
             LIMIT 1`,
            [req.user.id]
        );

        if (roadmapResult.rows.length === 0) {
            return res.json({ progress: null });
        }

        const data = roadmapResult.rows[0];
        const progress = {
            total_tasks: data.total_tasks || 0,
            completed_tasks: data.completed_tasks || 0,
            in_progress_tasks: data.in_progress_tasks || 0,
            todo_tasks: (data.total_tasks || 0) - (data.completed_tasks || 0) - (data.in_progress_tasks || 0),
            progress_percentage: data.total_tasks > 0
                ? Math.round((data.completed_tasks / data.total_tasks) * 100)
                : 0,
            total_estimated_hours: data.total_estimated_hours || 0,
            total_actual_hours: data.total_actual_hours || 0,
            roadmap_title: data.title
        };

        res.json({ progress });
    } catch (error) {
        console.error("Get progress error:", error);
        res.status(500).json({ error: "Failed to fetch progress" });
    }
});

/**
 * @route POST /api/planner/tasks
 * @desc Add custom task to roadmap
 * @access Private
 */
router.post("/tasks", authenticateToken, async (req, res) => {
    const { title, description, category, priority, difficulty, estimated_hours, milestone_id } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        // Get user's active roadmap
        const roadmapResult = await pool.query(
            `SELECT id FROM career_roadmaps WHERE user_id = $1 AND status = 'active' LIMIT 1`,
            [req.user.id]
        );

        if (roadmapResult.rows.length === 0) {
            return res.status(404).json({ error: "No active roadmap found" });
        }

        const roadmapId = roadmapResult.rows[0].id;

        // Get next sequence order
        const seqResult = await pool.query(
            `SELECT COALESCE(MAX(sequence_order), 0) + 1 as next_seq 
             FROM roadmap_tasks WHERE roadmap_id = $1`,
            [roadmapId]
        );
        const nextSeq = seqResult.rows[0].next_seq;

        // Create task
        const result = await pool.query(
            `INSERT INTO roadmap_tasks 
             (roadmap_id, milestone_id, title, description, category, priority, difficulty, estimated_hours, sequence_order, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'todo')
             RETURNING *`,
            [roadmapId, milestone_id, title, description, category || 'learning', priority || 'medium',
                difficulty || 'beginner', estimated_hours || 0, nextSeq]
        );

        res.status(201).json({ message: "Task created", task: result.rows[0] });
    } catch (error) {
        console.error("Create task error:", error);
        res.status(500).json({ error: "Failed to create task" });
    }
});

module.exports = router;
