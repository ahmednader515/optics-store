import { redirect } from 'next/navigation'

export default async function CartAddItemPage(props: {
  params: Promise<{ itemId: string }>
}) {
  const { itemId } = await props.params

  // This page should redirect to the product page or cart
  // since CartAddItem is meant to be used as a component within other pages
  redirect(`/cart`)
}
