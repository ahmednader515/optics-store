import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

type CardItem = {
  title: string
  link: { text: string; href: string }
  items: {
    name: string
    items?: string[]
    image: string
    href: string
  }[]
}

export function HomeCard({ cards }: { cards: CardItem[] }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-cairo' dir="rtl">
      {cards.map((card) => (
        <Card key={card.title} className='rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col bg-white'>
          <CardContent className='p-6 flex-1'>
            <h3 className='text-xl font-bold mb-6 text-right text-gray-800'>{card.title}</h3>
            <div className='grid grid-cols-2 gap-4'>
              {card.items
                .filter(item => item.href && item.name) // Filter out items with undefined href or name
                .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className='flex flex-col group'
                >
                  <div className='relative overflow-hidden rounded-lg bg-gray-50 mb-3'>
                    <Image
                      src={item.image}
                      alt={item.name}
                      className='aspect-square object-scale-down max-w-full h-auto mx-auto transition-transform duration-300 group-hover:scale-105'
                      height={120}
                      width={120}
                    />
                  </div>
                  <p className='text-center text-sm whitespace-nowrap overflow-hidden text-ellipsis text-gray-700 group-hover:text-primary transition-colors duration-200'>
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
          {card.link && (
            <CardFooter className='px-6 pb-6'>
              <Link 
                href={card.link.href} 
                className='block text-center text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline'
              >
                {card.link.text}
              </Link>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}
