'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function InvitePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleInvite = async () => {
      const token = searchParams.get('token');
      const orgSlug = searchParams.get('org');

      if (!token || !orgSlug) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        // 1. Verify the invite token
        const { data: invite, error: inviteError } = await supabase
          .from('organization_invites')
          .select('*')
          .eq('token', token)
          .single();

        if (inviteError || !invite) {
          throw new Error('Invalid or expired invitation');
        }

        if (new Date(invite.expires_at) < new Date()) {
          throw new Error('Invitation has expired');
        }

        // 2. Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          // If no user is logged in, redirect to sign up with the invite token
          router.push(`/auth/signup?invite=${token}&org=${orgSlug}`);
          return;
        }

        // 3. Check if user is already a member
        const { data: existingMember, error: memberError } = await supabase
          .from('organization_members')
          .select('*')
          .eq('user_id', user.id)
          .eq('organization_slug', orgSlug)
          .single();

        if (memberError && memberError.code !== 'PGRST116') {
          throw memberError;
        }

        if (existingMember) {
          // User is already a member, redirect to the organization
          router.push(`/${orgSlug}/dashboard`);
          return;
        }

        // 4. Create organization membership
        const { error: createError } = await supabase
          .from('organization_members')
          .insert([
            {
              user_id: user.id,
              organization_slug: orgSlug,
              role: invite.role,
              status: 'active',
              invited_by: invite.invited_by,
              joined_at: new Date().toISOString()
            }
          ]);

        if (createError) {
          throw createError;
        }

        // 5. Delete the invite
        const { error: deleteError } = await supabase
          .from('organization_invites')
          .delete()
          .eq('token', token);

        if (deleteError) {
          console.error('Error deleting invite:', deleteError);
        }

        toast.success('Successfully joined the organization!');
        router.push(`/${orgSlug}/dashboard`);
      } catch (error: any) {
        console.error('Error handling invite:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    handleInvite();
  }, [searchParams, router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
} 