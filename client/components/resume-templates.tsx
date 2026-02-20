"use client"

import { ResumeInfo } from "@/lib/api"
import { forwardRef } from "react"

interface TemplateProps {
    data: ResumeInfo
}

export const ModernTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
    return (
        <div ref={ref} className="bg-white text-black p-8 min-h-[1123px] w-[794px] mx-auto shadow-sm print:shadow-none text-sm font-sans">
            <header className="border-b-2 border-gray-800 pb-4 mb-6">
                <h1 className="text-4xl font-bold uppercase tracking-wide mb-2">{data.extracted_name}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600 text-xs">
                    {data.extracted_email && <span>{data.extracted_email}</span>}
                    {data.extracted_phone && <span>• {data.extracted_phone}</span>}
                    {data.extracted_location && <span>• {data.extracted_location}</span>}
                    {data.linkedin_url && <span>• {data.linkedin_url}</span>}
                </div>
            </header>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-6">
                    {data.professional_summary && (
                        <section>
                            <h2 className="text-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Summary</h2>
                            <p className="text-gray-700 leading-relaxed">{data.professional_summary}</p>
                        </section>
                    )}

                    {data.experience && data.experience.length > 0 && (
                        <section>
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
                    )}

                    {data.projects && data.projects.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Projects</h2>
                            <div className="space-y-3">
                                {data.projects.map((proj, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold text-gray-900">{proj.name}</h3>
                                            {proj.url && <a href={proj.url} className="text-xs text-blue-600 hover:underline">Link</a>}
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
                    )}
                </div>

                <div className="col-span-1 space-y-6">
                    {data.education && data.education.length > 0 && (
                        <section>
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
                    )}

                    {data.technical_skills && data.technical_skills.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {data.technical_skills.map((skill, i) => (
                                    <span key={i} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.soft_skills && data.soft_skills.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Soft Skills</h2>
                            <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                                {data.soft_skills.map((skill, i) => (
                                    <li key={i}>{skill}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {data.certifications && data.certifications.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Certifications</h2>
                            <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                                {data.certifications.map((cert, i) => (
                                    <li key={i}>{cert}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
})
ModernTemplate.displayName = "ModernTemplate"

export const ClassicTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
    return (
        <div ref={ref} className="bg-white text-black p-10 min-h-[1123px] w-[794px] mx-auto shadow-sm print:shadow-none font-serif">
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-3xl font-bold uppercase mb-2">{data.extracted_name}</h1>
                <p className="text-sm">
                    {data.extracted_location} | {data.extracted_phone} | {data.extracted_email}
                </p>
                {data.linkedin_url && <p className="text-sm text-blue-800">{data.linkedin_url}</p>}
            </div>

            <div className="space-y-5">
                {data.professional_summary && (
                    <section>
                        <h2 className="text-md font-bold uppercase border-b border-black mb-2">Professional Summary</h2>
                        <p className="text-sm text-justify leading-snug">{data.professional_summary}</p>
                    </section>
                )}

                {data.experience && data.experience.length > 0 && (
                    <section>
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
                )}

                {data.projects && data.projects.length > 0 && (
                    <section>
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
                )}

                {data.education && data.education.length > 0 && (
                    <section>
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
                )}

                {data.technical_skills && data.technical_skills.length > 0 && (
                    <section>
                        <h2 className="text-md font-bold uppercase border-b border-black mb-2">Technical Skills</h2>
                        <p className="text-sm">{data.technical_skills.join(", ")}</p>
                    </section>
                )}
            </div>
        </div>
    )
})
ClassicTemplate.displayName = "ClassicTemplate"

export const MinimalTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data }, ref) => {
    return (
        <div ref={ref} className="bg-white text-gray-800 p-12 min-h-[1123px] w-[794px] mx-auto shadow-sm print:shadow-none font-sans">
            <header className="mb-10">
                <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-4">{data.extracted_name}</h1>
                <div className="text-sm text-gray-500 space-y-1">
                    <p>{data.professional_title}</p>
                    <p>{data.extracted_email} • {data.extracted_phone}</p>
                    <p>{data.extracted_location}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-10">
                {data.professional_summary && (
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Profile</h3>
                        <p className="text-sm leading-relaxed text-gray-600 max-w-2xl">{data.professional_summary}</p>
                    </section>
                )}

                {data.experience && data.experience.length > 0 && (
                    <section>
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
                )}

                {data.projects && data.projects.length > 0 && (
                    <section>
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
                )}

                <div className="grid grid-cols-2 gap-8">
                    {data.education && data.education.length > 0 && (
                        <section>
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
                    )}

                    {data.technical_skills && data.technical_skills.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Skills</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {data.technical_skills.map((skill, i) => (
                                    <span key={i} className="text-sm text-gray-600">{skill}</span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
})
MinimalTemplate.displayName = "MinimalTemplate"
