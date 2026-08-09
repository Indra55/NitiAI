const fs = require('fs');
const path = './client/components/resume-templates.tsx';
let content = fs.readFileSync(path, 'utf8');

const minimalRenderSection = `
    const renderSection = (key: string) => {
        switch(key) {
            case "summary":
                return data.professional_summary ? (
                    <section key="summary">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Profile</h3>
                        <p className="text-sm leading-relaxed text-gray-600 max-w-2xl">{data.professional_summary}</p>
                    </section>
                ) : null;
            case "experience":
                return data.experience && data.experience.length > 0 ? (
                    <section key="experience">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Experience</h3>
                        <div className="space-y-8 border-l-2 border-gray-100 pl-6 ml-2">
                            {data.experience.map((exp, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-gray-200"></div>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h4 className="font-medium text-gray-900">{exp.title}</h4>
                                        <span className="text-xs text-gray-400">{exp.start} — {exp.end}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-2">{exp.company}</div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "projects":
                return data.projects && data.projects.length > 0 ? (
                    <section key="projects">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Projects</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.projects.map((proj, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-1">{proj.name}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{proj.description}</p>
                                    {proj.technologies && (
                                        <div className="flex flex-wrap gap-1">
                                            {(Array.isArray(proj.technologies) ? proj.technologies : (typeof proj.technologies === 'string' ? (proj.technologies as string).split(',') : [])).map((t, j) => (
                                                <span key={j} className="text-[10px] bg-white px-2 py-1 rounded border border-gray-100">{t.trim()}</span>
                                            ))}
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
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Education</h3>
                        <div className="space-y-4">
                            {data.education.map((edu, i) => (
                                <div key={i}>
                                    <div className="font-medium text-gray-900">{edu.institution}</div>
                                    <div className="text-sm text-gray-500">{edu.degree}</div>
                                    <div className="text-xs text-gray-400 mt-1">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "skills":
                return data.technical_skills && data.technical_skills.length > 0 ? (
                    <section key="skills">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {data.technical_skills.map((skill, i) => (
                                <span key={i} className="text-sm text-gray-600">{skill}</span>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "soft_skills":
                return data.soft_skills && data.soft_skills.length > 0 ? (
                    <section key="soft_skills">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Soft Skills</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {data.soft_skills.map((skill, i) => (
                                <span key={i} className="text-sm text-gray-600">{skill}</span>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "certifications":
                return data.certifications && data.certifications.length > 0 ? (
                    <section key="certifications">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Certifications</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {data.certifications.map((cert, i) => (
                                <span key={i} className="text-sm text-gray-600">{cert}</span>
                            ))}
                        </div>
                    </section>
                ) : null;
            default:
                return null;
        }
    };

    const topSectionOrder = data.template_layouts?.minimal?.top_section || ["summary", "experience", "projects"];
    const bottomGridOrder = data.template_layouts?.minimal?.bottom_grid || ["education", "skills", "soft_skills", "certifications"];
`;

const minimalReplaceTarget = `<div className="grid grid-cols-1 gap-10">`;
const minimalReplaceEnd = `</div>
            </div>
        </div>
    )
})`;

const minimalStartIndex = content.indexOf(minimalReplaceTarget);
const minimalEndIndex = content.indexOf(minimalReplaceEnd, minimalStartIndex) + minimalReplaceEnd.length;

if (minimalStartIndex !== -1 && minimalEndIndex !== -1) {
    const minimalNewContent = minimalRenderSection + `
            <div className="grid grid-cols-1 gap-10">
                {topSectionOrder.map(renderSection)}
                <div className="grid grid-cols-2 gap-8">
                    {bottomGridOrder.map(renderSection)}
                </div>
            </div>
        </div>
    )
})`;
    content = content.substring(0, minimalStartIndex) + minimalNewContent + content.substring(minimalEndIndex);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Minimal template refactored');
} else {
    console.log('Could not find Minimal template boundaries');
}
