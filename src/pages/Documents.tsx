import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FolderView } from '@/components/FolderView';
import { PersonView } from '@/components/PersonView';
import { Folder, Users } from 'lucide-react';

export default function Documents() {
  const [activeTab, setActiveTab] = useState('folders');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Page Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <h1 className="text-lg font-semibold">Saved Documents</h1>
      </div>

      {/* Tab Switcher */}
      <div className="border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b-0 h-12 p-0 bg-transparent">
            <TabsTrigger 
              value="folders" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Folder className="h-4 w-4 mr-2" />
              By Category
            </TabsTrigger>
            <TabsTrigger 
              value="persons"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Users className="h-4 w-4 mr-2" />
              By Person
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      {activeTab === 'folders' && <FolderView />}
      {activeTab === 'persons' && <PersonView />}
    </div>
  );
}
