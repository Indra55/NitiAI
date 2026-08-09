const fs = require('fs');
const path = './client/components/resume-templates.tsx';
let content = fs.readFileSync(path, 'utf8');

// ModernTemplate refactor
const modernRenderSection = `
    const renderSection = (key: string) => {
        switch(key) {
            case "summary":
                return data.professional_summary ? (
                    <section key="summary">
                        <h2 className="text-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Summary</h2>
                        <p className="text-gray-700 leading-relaxed">{data.professional_summary}</p>
                    </section>
                ) : null;
            case "experience":
                return data.experience && data.experience.length > 0 ? (
                    <section key="experience">
                        <h2 className="text-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Experience</h2>
                        <div className="space-y-4">
                            {data.experience.map((exp, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900">{exp.title}</h3>
                                        <span className="text-xs text-gray-500 font-medium">{exp.start} – {exp.end}</span>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700 mb-1">{exp.company}</div>
                                    <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "projects":
                return data.projects && data.projects.length > 0 ? (
                    <section key="projects">
                        <h2 className="text-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Projects</h2>
                        <div className="space-y-3">
                            {data.projects.map((proj, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-gray-900">{proj.name}</h3>
                                        {proj.url && <a href={formatExternalUrl(proj.url)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Link</a>}
                                    </div>
                                    <p className="text-gray-600 text-xs mt-1">{proj.description}</p>
                                    {proj.technologies && (
                                        <div className="text-xs text-gray-500 mt-1 italic">
                                            Tech: {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "education":
                return data.education && data.education.length > 0 ? (
                    <section key="education">
                        <h2 className="text-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Education</h2>
                        <div className="space-y-3">
                            {data.education.map((edu, i) => (
                                <div key={i}>
                                    <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                                    <div className="text-gray-700">{edu.degree}</div>
                                    <div className="text-gray-600 text-xs">{edu.field}</div>
                                    <div className="text-gray-500 text-xs mt-1">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "skills":
                return data.technical_skills && data.technical_skills.length > 0 ? (
                    <section key="skills">
                        <h2 className="text-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {data.technical_skills.map((skill, i) => (
                                <span key={i} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "soft_skills":
                return data.soft_skills && data.soft_skills.length > 0 ? (
                    <section key="soft_skills">
                        <h2 className="text-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Soft Skills</h2>
                        <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                            {data.soft_skills.map((skill, i) => (
                                <li key={i}>{skill}</li>
                            ))}
                        </ul>
                    </section>
                ) : null;
            case "certifications":
                return data.certifications && data.certifications.length > 0 ? (
                    <section key="certifications">
                        <h2 className="text-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Certifications</h2>
                        <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                            {data.certifications.map((cert, i) => (
                                <li key={i}>{cert}</li>
                            ))}
                        </ul>
                    </section>
                ) : null;
            default:
                return null;
        }
    };

    const leftColumnOrder = data.template_layouts?.modern?.left_column || ["summary", "experience", "projects"];
    const rightColumnOrder = data.template_layouts?.modern?.right_column || ["education", "skills", "soft_skills", "certifications"];
`;

const modernReplaceTarget = `<div className="grid grid-cols-3 gap-8">`;
const modernReplaceEnd = `</div>
            </div>
        </div>
    )
})`;

const modernStartIndex = content.indexOf(modernReplaceTarget);
const modernEndIndex = content.indexOf(modernReplaceEnd, modernStartIndex) + modernReplaceEnd.length;

if (modernStartIndex !== -1 && modernEndIndex !== -1) {
    const modernNewContent = modernRenderSection + `
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-6">
                    {leftColumnOrder.map(renderSection)}
                </div>
                <div className="col-span-1 space-y-6">
                    {rightColumnOrder.map(renderSection)}
                </div>
            </div>
        </div>
    )
})`;
    content = content.substring(0, modernStartIndex) + modernNewContent + content.substring(modernEndIndex);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Modern template refactored');
} else {
    console.log('Could not find Modern template boundaries');
}
