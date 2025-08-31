import { auth } from "@/auth";
import SidebarClient from "./sidebar.client";

// Arabic translations for categories
const categoryTranslations: { [key: string]: string } = {
  'Eyewear Frames': 'إطارات النظارات',
  'Contact Lenses': 'العدسات اللاصقة',
  'Sunglasses': 'النظارات الشمسية',
  'Reading Glasses': 'نظارات القراءة',
  'Computer Glasses': 'نظارات الكمبيوتر',
  'Prescription Eyewear': 'النظارات الموصوفة',
  'Over-the-Counter': 'النظارات المتاحة بدون وصفة',
  'Eye Care Products': 'منتجات العناية بالعين',
  'Vision & Eye Health': 'صحة العين والرؤية',
  'Eye Protection': 'حماية العين',
  'Kids Eyewear': 'نظارات الأطفال',
  'Senior Eyewear': 'نظارات كبار السن',
  'Sports Eyewear': 'نظارات الرياضة',
  'Fashion Eyewear': 'نظارات الموضة',
  'Professional Eyewear': 'النظارات المهنية',
  'Women\'s Eyewear': 'نظارات المرأة',
  'Men\'s Eyewear': 'نظارات الرجل',
  'Lens Coatings': 'طلاءات العدسات',
  'Eyewear Accessories': 'ملحقات النظارات',
  'Eye Care Solutions': 'محاليل العناية بالعين'
};

export default async function Sidebar({ categories }: { categories: string[] }) {
  const session = await auth()
  return (
    <SidebarClient 
      categories={categories} 
      session={session ? { name: session.user.name } : null}
    />
  )
}
