import SarvamIndicStudio from '@/components/sarvam/SarvamIndicStudio';

export const metadata = {
  title: 'Sarvam AI Indic Studio | NitiAI',
  description: 'Multilingual Career Guidance, Live Code Explainer, Socratic Debates, and HR Intelligence powered by Sarvam AI model stack.',
};

export default function SarvamPage() {
  return (
    <main className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <SarvamIndicStudio />
    </main>
  );
}
