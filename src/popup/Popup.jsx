import './Popup.css'
import { useState, useEffect } from 'react';
import PGenerator from "./components/PG/PasswordGenerator"
import WGenerator from "./components/WG/WordGenerator"
import { Tabs } from '@radix-ui/react-tabs';


export const Popup = () => {
  const [activeTab, setActiveTab] = useState('password')

  return (
    <div className='w-96 p-2 bg-white'>
      <div className='flex space-x-2 mb-4'>
        <Tabs
          onClick={() => setActiveTab('password')}
          className={`flex-1 p-2 text-center rounded ${activeTab === 'password' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
        >
          Password
        </Tabs>
        <Tabs
          onClick={() => setActiveTab('words')}
          className={`flex-1 p-2 text-center rounded ${activeTab === 'words' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
        >
          Words
        </Tabs>
      </div>

      {activeTab === 'password' ? <PGenerator /> : <WGenerator />}
    </div>
  )
}

export default Popup
