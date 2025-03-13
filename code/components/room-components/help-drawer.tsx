import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Keyboard } from "lucide-react";
import { ToolbarButton } from "./toolbar/toolbar-button";

export const HelpDrawer = () => {
  return (
    <Drawer>
      <DrawerTrigger>
        <ToolbarButton
          icon={<Keyboard />}
          onClick={() => {}}
          label="Keyboard shortcuts"
          tooltipSide="top"
        />
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
