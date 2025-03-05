"use client";

import Link from "next/link"
import React from "react";
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Logo } from "@/components/utils/logo";
import { useSearchParams } from "next/navigation";
import { getError } from "./errors";


export const Error = () => {
    const searchParams = useSearchParams();

    const errorCode = searchParams.get("errorCode");

    const { title, description, action, href } = getError(errorCode || "");
    

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">

        <div className="absolute left-4 top-4 text-lg font-semibold text-primary md:left-8 md:top-8"><Logo /></div>
  
        <Card className="mx-auto max-w-md shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-1 pb-2 pt-6 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Error</h1>
            <p className="text-muted-foreground">{title}</p>
          </CardHeader>
  
          <CardContent className="text-center">
            <p className="mb-4">
              <span className="font-semibold">{description}</span>
            </p>
          </CardContent>
  
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href={href}>
                {action}
              </Link>
            </Button>
          </CardFooter>
        </Card>
  
        <p className="mt-8 text-center text-sm text-muted-foreground">
          <span className="font-semibold">COLLABORATION TOOL SHOWCASE</span>
          <br />A tool for real-time collaboration
        </p>
      </div>
    );
  };
