import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";

const multiStepFormVariants = cva(
  "flex flex-col",
  {
    variants: {
      size: {
        default: "md:w-[700px]",
        sm: "md:w-[550px]",
        lg: "md:w-[850px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface MultiStepFormProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof multiStepFormVariants> {
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
  onBack: () => void;
  onNext: () => void;
  onClose?: () => void;
  backButtonText?: string;
  nextButtonText?: string;
  footerContent?: React.ReactNode;
}

const MultiStepForm = React.forwardRef<HTMLDivElement, MultiStepFormProps>(
  ({
    className,
    size,
    currentStep,
    totalSteps,
    title,
    description,
    onBack,
    onNext,
    onClose,
    backButtonText = "Back",
    nextButtonText = "Next Step",
    footerContent,
    children,
    ...props
  }, ref) => {
    const progress = Math.round((currentStep / totalSteps) * 100);

    const variants = {
      hidden: { opacity: 0, x: 100 },
      enter: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -100 },
    };

    return (
      <Card ref={ref} className={cn(multiStepFormVariants({ size }), "rounded-3xl border-slate-200 bg-white shadow-2xl shadow-slate-900/[0.06]", className)} {...props}>
        <CardHeader className="p-7 pb-5 md:p-9 md:pb-6">
          <div className="flex items-start justify-between">
            <CardTitle>{title}</CardTitle>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>{description}</CardDescription>
          <div className="flex items-center gap-4 pt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-xs font-bold text-muted-foreground whitespace-nowrap">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </CardHeader>

        <CardContent className="min-h-[300px] overflow-hidden px-7 md:px-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={variants}
              initial="hidden"
              animate="enter"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-slate-100 px-7 py-5 md:px-9">
          <div>{footerContent}</div>
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={onBack} className="rounded-xl border-slate-200 font-bold active:scale-[0.98]">
                {backButtonText}
              </Button>
            )}
            <Button type="button" onClick={onNext} className="rounded-xl bg-slate-900 px-5 font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-orange-500 active:scale-[0.98]">
              {nextButtonText}
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }
);

MultiStepForm.displayName = "MultiStepForm";

export { MultiStepForm };
