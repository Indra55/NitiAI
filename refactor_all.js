const fs = require('fs');
const path = './client/components/resume-templates.tsx';
let content = fs.readFileSync(path, 'utf8');

// --- MODERN TEMPLATE REFACTOR ---
const modernReplaceTarget = `export const ModernTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
    return (`;

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

if (content.includes(modernReplaceTarget)) {
    content = content.replace(modernReplaceTarget, `export const ModernTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
${modernRenderSection}
    return (`);

    const modernReplaceTarget2 = `<div className="grid grid-cols-3 gap-8">`;
    const modernReplaceEnd = `</div>
            </div>
        </div>
    )
})`;
    const mStartIndex = content.indexOf(modernReplaceTarget2);
    const mEndIndex = content.indexOf(modernReplaceEnd, mStartIndex) + modernReplaceEnd.length;
    if (mStartIndex !== -1) {
        const modernNewContent = `<div className="grid grid-cols-3 gap-8">
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
        content = content.substring(0, mStartIndex) + modernNewContent + content.substring(mEndIndex);
    }
}


// --- CLASSIC TEMPLATE REFACTOR ---
const classicReplaceTarget = `export const ClassicTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
    return (`;

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

if (content.includes(classicReplaceTarget)) {
    content = content.replace(classicReplaceTarget, `export const ClassicTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
${classicRenderSection}
    return (`);

    const classicReplaceTarget2 = `<div className="space-y-5">`;
    const classicReplaceEnd = `</div>
        </div>
    )
})`;
    const cStartIndex = content.indexOf(classicReplaceTarget2);
    const cEndIndex = content.indexOf(classicReplaceEnd, cStartIndex) + classicReplaceEnd.length;
    if (cStartIndex !== -1) {
        const classicNewContent = `<div className="space-y-5">
                {sectionOrder.map(renderSection)}
            </div>
        </div>
    )
})`;
        content = content.substring(0, cStartIndex) + classicNewContent + content.substring(cEndIndex);
    }
}


// --- MINIMAL TEMPLATE REFACTOR ---
const minimalReplaceTarget = `export const MinimalTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
    return (`;

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

if (content.includes(minimalReplaceTarget)) {
    content = content.replace(minimalReplaceTarget, `export const MinimalTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
${minimalRenderSection}
    return (`);

    const minimalReplaceTarget2 = `<div className="grid grid-cols-1 gap-10">`;
    const minimalReplaceEnd = `</div>
            </div>
        </div>
    )
})`;
    const minStartIndex = content.indexOf(minimalReplaceTarget2);
    const minEndIndex = content.indexOf(minimalReplaceEnd, minStartIndex) + minimalReplaceEnd.length;
    if (minStartIndex !== -1) {
        const minimalNewContent = `<div className="grid grid-cols-1 gap-10">
                {topSectionOrder.map(renderSection)}
                <div className="grid grid-cols-2 gap-8">
                    {bottomGridOrder.map(renderSection)}
                </div>
            </div>
        </div>
    )
})`;
        content = content.substring(0, minStartIndex) + minimalNewContent + content.substring(minEndIndex);
    }
}

fs.writeFileSync(path, content, 'utf8');
console.log('All templates refactored correctly!');
