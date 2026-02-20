// API functions for AI Planner

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

export async function generateRoadmap() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/planner/generate-roadmap`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate roadmap');
    }

    return response.json();
}

export async function getRoadmap() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/planner/roadmap`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch roadmap');
    }

    return response.json();
}

export async function getMilestones() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/planner/milestones`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch milestones');
    }

    return response.json();
}

export async function getTasks() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/planner/tasks`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch tasks');
    }

    return response.json();
}

export async function moveTask(taskId: string, newStatus: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/planner/tasks/${taskId}/move`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move task');
    }

    return response.json();
}

export async function updateTask(taskId: string, updates: any) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/planner/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        throw new Error('Failed to update task');
    }

    return response.json();
}

export async function deleteTask(taskId: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/planner/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete task');
    }

    return response.json();
}

export async function getProgress() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/planner/progress`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch progress');
    }

    return response.json();
}

export async function getDependencies() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/planner/dependencies`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch dependencies');
    }

    return response.json();
}

export async function createTask(taskData: any) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/planner/tasks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
    }

    return response.json();
}
