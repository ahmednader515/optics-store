"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border-2 p-4 pr-6 shadow-xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-orange-300 bg-orange-50 text-orange-900 shadow-orange-200/50",
        destructive:
          "border-red-300 bg-red-50 text-red-900 shadow-red-200/50",
        success: "border-green-300 bg-green-50 text-green-900 shadow-green-200/50",
        warning: "border-yellow-300 bg-yellow-50 text-yellow-900 shadow-yellow-200/50",
        info: "border-orange-300 bg-orange-50 text-orange-900 shadow-orange-200/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), "font-cairo", className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-9 shrink-0 items-center justify-center rounded-md border-2 bg-white px-4 text-sm font-medium transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-300 group-[.destructive]:text-red-700 group-[.destructive]:hover:bg-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-50 group-[.success]:border-green-300 group-[.success]:text-green-700 group-[.success]:hover:bg-green-50 group-[.success]:focus:ring-green-400 group-[.success]:focus:ring-offset-green-50 group-[.warning]:border-yellow-300 group-[.warning]:text-yellow-700 group-[.warning]:hover:bg-yellow-50 group-[.warning]:focus:ring-yellow-400 group-[.warning]:focus:ring-offset-yellow-50 group-[.info]:border-orange-300 group-[.info]:text-orange-700 group-[.info]:hover:bg-orange-50 group-[.info]:focus:ring-orange-400 group-[.info]:focus:ring-offset-orange-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1.5 text-foreground/70 opacity-0 transition-all hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 group-hover:opacity-100 group-[.destructive]:text-red-700 group-[.destructive]:hover:text-red-900 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-50 group-[.success]:text-green-700 group-[.success]:hover:text-green-900 group-[.success]:focus:ring-green-400 group-[.success]:focus:ring-offset-green-50 group-[.warning]:text-yellow-700 group-[.warning]:hover:text-yellow-900 group-[.warning]:focus:ring-yellow-400 group-[.warning]:focus:ring-offset-yellow-50 group-[.info]:text-orange-700 group-[.info]:hover:text-orange-900 group-[.info]:focus:ring-orange-400 group-[.info]:focus:ring-offset-orange-50",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold [&+div]:text-xs font-cairo", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90 font-cairo", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
