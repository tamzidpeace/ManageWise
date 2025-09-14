'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function ToastDemoPage() {
  const { toast } = useToast();
  const router = useRouter();

  const showSuccessToast = () => {
    toast({
      variant: 'success',
      title: 'Success!',
      description: 'User created successfully.',
    });
  };

  const showErrorToast = () => {
    toast({
      variant: 'destructive',
      title: 'Error!',
      description: 'Failed to create user. Please try again.',
    });
  };

  const showWarningToast = () => {
    toast({
      variant: 'warning',
      title: 'Warning!',
      description: 'Please check the form fields before submitting.',
    });
  };

  const showInfoToast = () => {
    toast({
      variant: 'info',
      title: 'Information',
      description: 'User data has been updated.',
    });
  };

  const showSimpleToast = () => {
    toast({
      title: 'Notification',
      description: 'This is a simple notification.',
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Toast Notifications Demo</h1>
        <Button 
          onClick={() => router.push('/acl/users')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Toast Notification Examples</h2>
        <p className="mb-6 text-gray-600">
          This page demonstrates different types of toast notifications that can be used in the user management system.
        </p>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button onClick={showSuccessToast} className="bg-green-500 hover:bg-green-600">
            Show Success Toast
          </Button>
          
          <Button onClick={showErrorToast} variant="destructive">
            Show Error Toast
          </Button>
          
          <Button onClick={showWarningToast} className="bg-yellow-500 hover:bg-yellow-600">
            Show Warning Toast
          </Button>
          
          <Button onClick={showInfoToast} className="bg-blue-500 hover:bg-blue-600">
            Show Info Toast
          </Button>
          
          <Button onClick={showSimpleToast} variant="outline">
            Show Simple Toast
          </Button>
        </div>
        
        <div className="mt-8">
          <h3 className="mb-2 text-lg font-medium">Implementation Guide</h3>
          <p className="mb-4 text-gray-600">
            To use toast notifications in your components:
          </p>
          <pre className="rounded bg-gray-100 p-4 text-sm">
            {`import { useToast } from '@/hooks/useToast';

const { toast } = useToast();

// Success notification
toast({
  variant: 'success',
  title: 'Success!',
  description: 'User created successfully.',
});

// Error notification
toast({
  variant: 'destructive',
  title: 'Error!',
  description: 'Failed to create user.',
});`}
          </pre>
        </div>
      </div>
    </div>
  );
}