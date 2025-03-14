import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Keyboard } from "lucide-react";

export const HelpDrawer = () => {
  return (
    <Drawer>
      <DrawerTrigger>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger
              asChild
              className="cursor-pointer hover:text-black hover:bg-accent w-8 h-8 px-2 py-2"
            >
              <Keyboard />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Keyboard shortcuts</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DrawerTrigger>
      <DrawerContent className="p-5 bg-black flex flex-col justify-center items-center">
        <DrawerHeader className="w-full flex justify-center items-centers">
          <DrawerTitle className="text-center text-white font-noto-sans-mono">
            Keyboard shortcuts
          </DrawerTitle>
        </DrawerHeader>
        <Tabs defaultValue="tools" className="w-[1024px] my-5 mb-7 p-0">
          <TabsList className="w-full bg-zinc-700 rounded-none  h-auto">
            <TabsTrigger
              value="tools"
              className="cursor-pointer bg-black rounded-none p-1"
            >
              Tools
            </TabsTrigger>
            <TabsTrigger
              value="view"
              className="cursor-pointer bg-black rounded-none p-1"
            >
              View
            </TabsTrigger>
            <TabsTrigger
              value="zoom"
              className="cursor-pointer bg-black rounded-none p-1"
            >
              Zoom
            </TabsTrigger>
            <TabsTrigger
              value="selection"
              className="cursor-pointer bg-black rounded-none p-1"
            >
              Selection
            </TabsTrigger>
            <TabsTrigger
              value="edit"
              className="cursor-pointer bg-black rounded-none p-1"
            >
              Edit
            </TabsTrigger>
            <TabsTrigger
              value="arrange"
              className="cursor-pointer bg-black rounded-none p-1"
            >
              Arrange
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tools" className="border border-white">
            <div className=""></div>
          </TabsContent>
          <TabsContent value="view" className="border border-white">
            Change your password here.
          </TabsContent>
          <TabsContent value="zoom" className="border border-white">
            Change your password here.
          </TabsContent>
          <TabsContent value="selection" className="border border-white">
            Change your password here.
          </TabsContent>
          <TabsContent value="edit" className="border border-white">
            Change your password here.
          </TabsContent>
          <TabsContent value="arrange" className="border border-white">
            Change your password here.
          </TabsContent>
        </Tabs>
        <DrawerClose>
          <Button className="rounded-none font-noto-sans-mono">CLOSE</Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
};
