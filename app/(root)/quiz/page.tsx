import { Metadata } from 'next'
import GlassesQuiz from '@/components/shared/quiz/glasses-quiz'

export const metadata: Metadata = {
  title: 'اختبار اختيار النظارات المناسبة',
  description: 'اكتشف النظارات المثالية لك من خلال اختبار سريع ومخصص',
}

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            اختبار اختيار النظارات المناسبة
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اكتشف النظارات المثالية لك من خلال الإجابة على بعض الأسئلة البسيطة. 
            سنقترح عليك أفضل الخيارات بناءً على احتياجاتك ونمط حياتك.
          </p>
        </div>
        <GlassesQuiz />
      </div>
    </div>
  )
}
