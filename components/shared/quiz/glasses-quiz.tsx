'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Eye, Monitor, Sun, BookOpen, Heart, Zap, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react'
import Link from 'next/link'

interface QuizQuestion {
  id: string
  question: string
  options: {
    id: string
    text: string
    icon: React.ReactNode
    score: { [key: string]: number }
  }[]
}

interface QuizResult {
  category: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  url: string
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'usage',
    question: 'ما هو الاستخدام الأساسي الذي تبحث عنه؟',
    options: [
      {
        id: 'computer',
        text: 'العمل على الكمبيوتر',
        icon: <Monitor className="w-6 h-6" />,
        score: { computer: 3, reading: 2, medical: 1, sunglasses: 0, contact: 1, care: 0 }
      },
      {
        id: 'reading',
        text: 'القراءة والدراسة',
        icon: <BookOpen className="w-6 h-6" />,
        score: { reading: 3, medical: 2, computer: 1, sunglasses: 0, contact: 1, care: 0 }
      },
      {
        id: 'outdoor',
        text: 'الأنشطة الخارجية',
        icon: <Sun className="w-6 h-6" />,
        score: { sunglasses: 3, contact: 2, medical: 1, computer: 0, reading: 0, care: 1 }
      },
      {
        id: 'vision',
        text: 'تحسين الرؤية العامة',
        icon: <Eye className="w-6 h-6" />,
        score: { medical: 3, contact: 2, reading: 1, computer: 1, sunglasses: 0, care: 1 }
      }
    ]
  },
  {
    id: 'lifestyle',
    question: 'كيف تصف نمط حياتك؟',
    options: [
      {
        id: 'active',
        text: 'نشط ورياضي',
        icon: <Zap className="w-6 h-6" />,
        score: { sunglasses: 2, contact: 3, medical: 1, computer: 0, reading: 0, care: 1 }
      },
      {
        id: 'professional',
        text: 'مهني وعملي',
        icon: <Monitor className="w-6 h-6" />,
        score: { computer: 3, medical: 2, reading: 1, sunglasses: 0, contact: 1, care: 0 }
      },
      {
        id: 'casual',
        text: 'عادي ومريح',
        icon: <Heart className="w-6 h-6" />,
        score: { reading: 2, medical: 2, sunglasses: 1, computer: 1, contact: 1, care: 1 }
      },
      {
        id: 'outdoor',
        text: 'خارجي ومغامر',
        icon: <Sun className="w-6 h-6" />,
        score: { sunglasses: 3, contact: 2, medical: 1, computer: 0, reading: 0, care: 1 }
      }
    ]
  },
  {
    id: 'preference',
    question: 'ما هو تفضيلك الشخصي؟',
    options: [
      {
        id: 'comfort',
        text: 'الراحة والسهولة',
        icon: <Heart className="w-6 h-6" />,
        score: { contact: 3, medical: 2, reading: 2, computer: 1, sunglasses: 1, care: 1 }
      },
      {
        id: 'style',
        text: 'الأناقة والمظهر',
        icon: <Eye className="w-6 h-6" />,
        score: { sunglasses: 3, medical: 2, reading: 2, computer: 1, contact: 1, care: 0 }
      },
      {
        id: 'functionality',
        text: 'الوظائف المتقدمة',
        icon: <Zap className="w-6 h-6" />,
        score: { computer: 3, medical: 2, reading: 1, sunglasses: 1, contact: 2, care: 1 }
      },
      {
        id: 'maintenance',
        text: 'سهولة الصيانة',
        icon: <BookOpen className="w-6 h-6" />,
        score: { reading: 3, medical: 2, sunglasses: 2, computer: 1, contact: 0, care: 2 }
      }
    ]
  },
  {
    id: 'age',
    question: 'في أي فئة عمرية تقع؟',
    options: [
      {
        id: 'young',
        text: '18-30 سنة',
        icon: <Zap className="w-6 h-6" />,
        score: { contact: 3, sunglasses: 2, computer: 2, medical: 1, reading: 0, care: 1 }
      },
      {
        id: 'middle',
        text: '31-50 سنة',
        icon: <Monitor className="w-6 h-6" />,
        score: { computer: 3, medical: 2, reading: 2, sunglasses: 1, contact: 2, care: 1 }
      },
      {
        id: 'mature',
        text: '51-65 سنة',
        icon: <BookOpen className="w-6 h-6" />,
        score: { reading: 3, medical: 3, computer: 2, sunglasses: 1, contact: 1, care: 2 }
      },
      {
        id: 'senior',
        text: 'أكثر من 65 سنة',
        icon: <Heart className="w-6 h-6" />,
        score: { reading: 3, medical: 3, care: 3, computer: 1, sunglasses: 1, contact: 0 }
      }
    ]
  }
]

const quizResults: { [key: string]: QuizResult } = {
  computer: {
    category: 'نظارات الكمبيوتر',
    title: 'نظارات الكمبيوتر المثالية لك',
    description: 'نظارات مصممة خصيصاً لحماية عينيك من الضوء الأزرق المنبعث من الشاشات، مع تقليل إجهاد العين وتحسين التركيز.',
    icon: <Monitor className="w-8 h-8" />,
    color: 'bg-blue-500',
    url: '/search?category=نظارات الكمبيوتر'
  },
  reading: {
    category: 'نظارات القراءة',
    title: 'نظارات القراءة المناسبة لك',
    description: 'نظارات مريحة وواضحة للقراءة والدراسة، مع عدسات عالية الجودة لرؤية مثالية.',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'bg-green-500',
    url: '/search?category=نظارات القراءة'
  },
  sunglasses: {
    category: 'النظارات الشمسية',
    title: 'النظارات الشمسية المثالية لك',
    description: 'نظارات شمسية أنيقة ومتينة مع حماية 100% من الأشعة فوق البنفسجية، مثالية للأنشطة الخارجية.',
    icon: <Sun className="w-8 h-8" />,
    color: 'bg-yellow-500',
    url: '/search?category=النظارات الشمسية'
  },
  medical: {
    category: 'النظارات الطبية',
    title: 'النظارات الطبية المناسبة لك',
    description: 'نظارات طبية عالية الجودة مع عدسات مخصصة لتحسين الرؤية، مصنوعة من مواد متينة ومريحة.',
    icon: <Eye className="w-8 h-8" />,
    color: 'bg-purple-500',
    url: '/search?category=النظارات الطبية'
  },
  contact: {
    category: 'العدسة اللاصقة',
    title: 'العدسات اللاصقة المثالية لك',
    description: 'عدسات لاصقة مريحة وآمنة مع تقنيات متقدمة للرطوبة والوضوح، مثالية للنشاط والحركة.',
    icon: <Heart className="w-8 h-8" />,
    color: 'bg-pink-500',
    url: '/search?category=العدسة اللاصقة'
  },
  care: {
    category: 'مستلزمات العناية',
    title: 'منتجات العناية بالعين المناسبة لك',
    description: 'منتجات عالية الجودة للعناية بالعين والنظارات، لضمان النظافة والراحة المثلى.',
    icon: <Heart className="w-8 h-8" />,
    color: 'bg-indigo-500',
    url: '/search?category=مستلزمات العناية'
  }
}

export default function GlassesQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [scores, setScores] = useState<{ [key: string]: number }>({
    computer: 0,
    reading: 0,
    sunglasses: 0,
    medical: 0,
    contact: 0,
    care: 0
  })
  const [showResult, setShowResult] = useState(false)

  const handleAnswer = (questionId: string, optionId: string, optionScore: { [key: string]: number }) => {
    const newAnswers = { ...answers, [questionId]: optionId }
    setAnswers(newAnswers)

    // Update scores
    const newScores = { ...scores }
    Object.keys(optionScore).forEach(category => {
      newScores[category] += optionScore[category]
    })
    setScores(newScores)

    // Move to next question or show result
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResult(true)
    }
  }

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setScores({
      computer: 0,
      reading: 0,
      sunglasses: 0,
      medical: 0,
      contact: 0,
      care: 0
    })
    setShowResult(false)
  }

  const getResult = () => {
    const maxScore = Math.max(...Object.values(scores))
    const resultCategory = Object.keys(scores).find(category => scores[category] === maxScore) || 'medical'
    return quizResults[resultCategory]
  }

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  if (showResult) {
    const result = getResult()
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <div className={`w-16 h-16 ${result.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
              {result.icon}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {result.title}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {result.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(scores)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([category, score]) => (
                  <Badge 
                    key={category} 
                    variant={category === Object.keys(scores).find(c => scores[c] === Math.max(...Object.values(scores))) ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {quizResults[category].category}: {score}
                  </Badge>
                ))}
            </div>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href={result.url}>
                  عرض المنتجات المقترحة
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={resetQuiz}>
                <RotateCcw className="w-4 h-4 mr-2" />
                إعادة الاختبار
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = quizQuestions[currentQuestion]

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-600">
              سؤال {currentQuestion + 1} من {quizQuestions.length}
            </h2>
            <Button variant="ghost" size="sm" onClick={resetQuiz}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-xl font-bold text-center">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQ.options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/20 transition-all"
                onClick={() => handleAnswer(currentQ.id, option.id, option.score)}
              >
                <div className="text-primary">
                  {option.icon}
                </div>
                <span className="text-sm font-medium">{option.text}</span>
              </Button>
            ))}
          </div>
          {currentQuestion > 0 && (
            <div className="flex justify-center mt-6">
              <Button variant="ghost" onClick={goToPrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                السؤال السابق
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
