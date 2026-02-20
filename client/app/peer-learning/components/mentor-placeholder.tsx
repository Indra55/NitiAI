"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Lock } from "lucide-react"

export function MentorPlaceholder() {
  return (
    <Card className="relative overflow-hidden border-border/40 bg-linear-to-br from-indigo-500/10 to-purple-500/10 p-6">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        <div className="p-3 rounded-full bg-background/50 backdrop-blur-md border border-white/10 shadow-lg">
          <GraduationCap className="w-8 h-8 text-indigo-400" />
        </div>
        
        <div>
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-300 to-purple-300">
            Mentor Connect
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-[200px] mx-auto">
            1-on-1 guidance from industry experts at top tech companies.
          </p>
        </div>

        <div className="pt-2">
            <Button disabled variant="secondary" className="gap-2 bg-white/5 hover:bg-white/10 border-white/5">
                <Lock className="w-3 h-3" />
                Coming Soon
            </Button>
        </div>
      </div>
    </Card>
  )
}
