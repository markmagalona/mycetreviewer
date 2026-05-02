// src/app/admin/schools/page.tsx
// Schools are auto-approved on submission — this is the review queue
// Admin rejects incorrect ones (wrong name, doesn't exist, duplicate)

import { createAdminClient } from '@/lib/supabase/server'

async function getSchools() {
  const supabase = createAdminClient()
  const [communityRes, verifiedRes] = await Promise.all([
    // Community-submitted schools (unverified) — need review
    supabase.from('schools_ph')
      .select('id, name, region, created_at')
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(100),
    // Count of verified schools
    supabase.from('schools_ph')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true),
  ])
  return {
    community: communityRes.data || [],
    verifiedCount: verifiedRes.count || 0,
  }
}

export default async function AdminSchoolsPage() {
  const { community, verifiedCount } = await getSchools()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Schools</h1>
          <p className="text-gray-400 text-sm mt-1">
            {verifiedCount} DepEd-verified · {community.length} community-submitted (live, pending review)
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-blue-950 border border-blue-800 rounded-xl p-4 mb-6">
        <div className="text-sm font-bold text-blue-300 mb-1">How school submissions work</div>
        <div className="text-xs text-blue-400 leading-relaxed">
          When a student submits their school, it is <strong className="text-blue-200">immediately added and usable</strong> — 
          no waiting. Community-submitted schools appear here for you to review. 
          Reject any that are wrong (misspelled, fake, duplicate) — they will be removed from search results.
        </div>
      </div>

      {/* Community submitted — needs review */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">
              Community Submissions — Review Queue ({community.length})
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              These are already live. Reject incorrect ones to remove them.
            </div>
          </div>
        </div>

        {community.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No community submissions yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {community.map((school: any) => (
              <div key={school.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{school.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {school.region || 'Region not set'} · Added {new Date(school.created_at).toLocaleDateString('en-PH')}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {/* Verify — marks as DepEd-verified */}
                  <form action="/api/admin/schools/approve" method="POST">
                    <input type="hidden" name="schoolId" value={school.id} />
                    <input type="hidden" name="action" value="verify" />
                    <button type="submit"
                      className="text-xs bg-green-800 hover:bg-green-700 text-green-300 font-bold px-3 py-1.5 rounded-lg transition-colors">
                      ✓ Verify
                    </button>
                  </form>
                  {/* Reject — removes from schools_ph */}
                  <form action="/api/admin/schools/reject" method="POST">
                    <input type="hidden" name="schoolId" value={school.id} />
                    <button type="submit"
                      className="text-xs border border-red-800 hover:border-red-600 text-red-400 font-bold px-3 py-1.5 rounded-lg transition-colors">
                      ✗ Remove
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add school manually */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mt-4">
        <div className="text-sm font-bold text-white mb-2">Add a verified school manually</div>
        <div className="text-xs text-gray-400 mb-3">
          For confirmed DepEd-registered schools not yet in the list:
        </div>
        <pre className="bg-gray-900 rounded-lg p-3 text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
{`INSERT INTO schools_ph (name, region, type, level, verified)
VALUES ('School Name', 'Region X', 'public', 'SHS', true);`}
        </pre>
      </div>
    </div>
  )
}
