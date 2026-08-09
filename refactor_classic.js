const fs = require('fs');
const path = './client/components/resume-templates.tsx';
let content = fs.readFileSync(path, 'utf8');

// ClassicTemplate refactor
const classicRenderSection = `
    const renderSection = (key: string) => {
        switch(key) {
            case "summary":
                return data.professional_summary ? (
                    <section key="summary">
                        <h2 className="text-md font-bold uppercase border-b border-black mb-2">Professional Summary</h2>
                        <p className="text-sm text-justify leading-snug">{data.professional_summary}</p>
                    </section>
                ) : null;
            case "experience":
                return data.experience && data.experience.length > 0 ? (
                    <section key="experience">
                        <h2 className="text-md font-bold uppercase border-b border-black mb-3">Experience</h2>
                        <div className="space-y-4">
                            {data.experience.map((exp, i) => (
                                <div key={i}>
                                    <div className="flex justify-between font-bold text-sm">
                                        <span>{exp.company}</span>
                                        <span>{exp.start} – {exp.end}</span>
                                    </div>
                                    <div className="italic text-sm mb-1">{exp.title}</div>
                                    <p className="text-sm text-justify leading-snug">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "projects":
                return data.projects && data.projects.length > 0 ? (
                    <section key="projects">
                        <h2 className="text-md font-bold uppercase border-b border-black mb-3">Projects</h2>
                        <div className="space-y-3">
                            {data.projects.map((proj, i) => (
                                <div key={i}>
                                    <div className="flex justify-between font-bold text-sm">
                                        <span>{proj.name}</span>
                                        {proj.url && <span className="font-normal text-blue-800">{proj.url}</span>}
                                    </div>
                                    <p className="text-sm text-justify leading-snug">{proj.description}</p>
                                    {proj.technologies && (
                                        <p className="text-xs italic mt-1">
                                            Technologies: {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "education":
                return data.education && data.education.length > 0 ? (
                    <section key="education">
                        <h2 className="text-md font-bold uppercase border-b border-black mb-3">Education</h2>
                        <div className="space-y-2">
                            {data.education.map((edu, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <div>
                                        <span className="font-bold">{edu.institution}</span>, {edu.degree} in {edu.field}
                                    </div>
                                    <span>{edu.year}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "skills":
                return data.technical_skills && data.technical_skills.length > 0 ? (
                    <section key="skills">
                        <h2 className="text-md font-bold uppercase border-b border-black mb-2">Technical Skills</h2>
                        <p className="text-sm">{data.technical_skills.join(", ")}</p>
                    </section>
                ) : null;
            case "soft_skills":
                return data.soft_skills && data.soft_skills.length > 0 ? (
                    <section key="soft_skills">
                        <h2 className="text-md font-bold uppercase border-b border-black mb-2">Soft Skills</h2>
                        <p className="text-sm">{data.soft_skills.join(", ")}</p>
                    </section>
                ) : null;
            case "certifications":
                return data.certifications && data.certifications.length > 0 ? (
                    <section key="certifications">
                        <h2 className="text-md font-bold uppercase border-b border-black mb-2">Certifications</h2>
                        <p className="text-sm">{data.certifications.join(", ")}</p>
                    </section>
                ) : null;
            default:
                return null;
        }
    };

    const sectionOrder = data.template_layouts?.classic?.section_order || ["summary", "experience", "projects", "education", "skills", "soft_skills", "certifications"];
`;

const classicReplaceTarget = `<div className="space-y-5">`;
const classicReplaceEnd = `</div>
        </div>
    )
})`;

const classicStartIndex = content.indexOf(classicReplaceTarget);
const classicEndIndex = content.indexOf(classicReplaceEnd, classicStartIndex) + classicReplaceEnd.length;

if (classicStartIndex !== -1 && classicEndIndex !== -1) {
    const classicNewContent = classicRenderSection + `
            <div className="space-y-5">
                {sectionOrder.map(renderSection)}
            </div>
        </div>
    )
})`;
    content = content.substring(0, classicStartIndex) + classicNewContent + content.substring(classicEndIndex);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Classic template refactored');
} else {
    console.log('Could not find Classic template boundaries');
}
