/**
 * ISR Enhancement Demo Page
 *
 * Demonstrates the Phase 3 ISR Enhancement features including
 * different revalidation strategies and cache controls.
 */

import { type Metadata } from 'next';
import { Suspense } from 'react';
import { ISR_REVALIDATION, ISR_TAGS, STATIC_GENERATION_LIMITS } from '@/src/lib/isr/isr-config';

export const metadata: Metadata = {
  title: 'ISR Enhancement Demo - SP Tech',
  description: 'Demonstration of Phase 3 ISR Enhancement with intelligent static generation and cache management.',
  robots: 'noindex, nofollow',
};

// ISR configuration for this demo page
export const revalidate = 3600; // 1 hour (ISR_REVALIDATION.CMS_PAGES)
export const dynamic = 'force-static';

interface ISRMetrics {
  generatedAt: string;
  revalidateTime: number;
  buildId: string;
  region: string;
  nodeVersion: string;
  nextVersion: string;
}

async function getISRMetrics(): Promise<ISRMetrics> {
  // Simulate some processing time
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    generatedAt: new Date().toISOString(),
    revalidateTime: revalidate,
    buildId: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || 'dev',
    region: process.env.VERCEL_REGION || 'local',
    nodeVersion: process.version,
    nextVersion: '15.0.0',
  };
}

async function getStaticGenerationStats() {
  return {
    topProductsPerLocale: STATIC_GENERATION_LIMITS.TOP_PRODUCTS_PER_LOCALE,
    allCategoryPages: STATIC_GENERATION_LIMITS.ALL_CATEGORY_PAGES,
    popularSearchTerms: STATIC_GENERATION_LIMITS.POPULAR_SEARCH_TERMS,
    keyLandingPages: STATIC_GENERATION_LIMITS.KEY_LANDING_PAGES.length,
    isrTags: Object.keys(ISR_TAGS).length,
    revalidationStrategies: Object.keys(ISR_REVALIDATION).length,
  };
}

function ISRMetricsCard({ metrics }: { metrics: ISRMetrics }) {
  return (
    <div className={'mb-8 rounded-lg bg-white p-6 shadow-md'}>
      <h2 className={'mb-4 text-xl font-semibold text-gray-800'}>ISR Enhancement Metrics</h2>
      <div className={'grid grid-cols-2 gap-4 md:grid-cols-3'}>
        <div>
          <p className={'text-sm text-gray-600'}>Generated At</p>
          <p className={'font-mono text-sm'}>{new Date(metrics.generatedAt).toLocaleString()}</p>
        </div>
        <div>
          <p className={'text-sm text-gray-600'}>Revalidate Time</p>
          <p className={'font-mono text-sm'}>{metrics.revalidateTime}s</p>
        </div>
        <div>
          <p className={'text-sm text-gray-600'}>Build ID</p>
          <p className={'font-mono text-sm'}>{metrics.buildId}</p>
        </div>
        <div>
          <p className={'text-sm text-gray-600'}>Region</p>
          <p className={'font-mono text-sm'}>{metrics.region}</p>
        </div>
        <div>
          <p className={'text-sm text-gray-600'}>Node Version</p>
          <p className={'font-mono text-sm'}>{metrics.nodeVersion}</p>
        </div>
        <div>
          <p className={'text-sm text-gray-600'}>Next.js Version</p>
          <p className={'font-mono text-sm'}>{metrics.nextVersion}</p>
        </div>
      </div>
    </div>
  );
}

async function RevalidationStrategiesCard() {
  return (
    <div className={'mb-8 rounded-lg bg-white p-6 shadow-md'}>
      <h2 className={'mb-4 text-xl font-semibold text-gray-800'}>Revalidation Strategies</h2>
      <div className={'space-y-3'}>
        <div className={'bg-blue-50 flex items-center justify-between rounded p-3'}>
          <span className={'font-medium'}>Product Pages</span>
          <span className={'bg-blue-100 text-blue-800 rounded px-2 py-1 text-sm'}>
            {ISR_REVALIDATION.PRODUCT_PAGES}s (5 min)
          </span>
        </div>
        <div className={'bg-green-50 flex items-center justify-between rounded p-3'}>
          <span className={'font-medium'}>Category Pages</span>
          <span className={'bg-green-100 text-green-800 rounded px-2 py-1 text-sm'}>
            {ISR_REVALIDATION.CATEGORY_PAGES}s (30 min)
          </span>
        </div>
        <div className={'bg-orange-50 flex items-center justify-between rounded p-3'}>
          <span className={'font-medium'}>CMS Pages</span>
          <span className={'bg-orange-100 text-orange-800 rounded px-2 py-1 text-sm'}>
            {ISR_REVALIDATION.CMS_PAGES}s (1 hour)
          </span>
        </div>
        <div className={'bg-purple-50 flex items-center justify-between rounded p-3'}>
          <span className={'font-medium'}>Search Pages</span>
          <span className={'bg-purple-100 text-purple-800 rounded px-2 py-1 text-sm'}>
            {ISR_REVALIDATION.SEARCH_PAGES}s (15 min)
          </span>
        </div>
      </div>
    </div>
  );
}

async function StaticGenerationCard() {
  const stats = await getStaticGenerationStats();

  return (
    <div className={'mb-8 rounded-lg bg-white p-6 shadow-md'}>
      <h2 className={'mb-4 text-xl font-semibold text-gray-800'}>Static Generation Configuration</h2>
      <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
        <div>
          <h3 className={'mb-2 font-medium text-gray-700'}>Generation Limits</h3>
          <div className={'space-y-2 text-sm'}>
            <div className={'flex justify-between'}>
              <span>Top Products/Locale:</span>
              <span className={'font-mono'}>{stats.topProductsPerLocale}</span>
            </div>
            <div className={'flex justify-between'}>
              <span>All Category Pages:</span>
              <span className={'font-mono'}>{stats.allCategoryPages ? 'Yes' : 'No'}</span>
            </div>
            <div className={'flex justify-between'}>
              <span>Popular Search Terms:</span>
              <span className={'font-mono'}>{stats.popularSearchTerms}</span>
            </div>
            <div className={'flex justify-between'}>
              <span>Key Landing Pages:</span>
              <span className={'font-mono'}>{stats.keyLandingPages}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className={'mb-2 font-medium text-gray-700'}>ISR Configuration</h3>
          <div className={'space-y-2 text-sm'}>
            <div className={'flex justify-between'}>
              <span>Cache Tags:</span>
              <span className={'font-mono'}>{stats.isrTags}</span>
            </div>
            <div className={'flex justify-between'}>
              <span>Revalidation Strategies:</span>
              <span className={'font-mono'}>{stats.revalidationStrategies}</span>
            </div>
            <div className={'flex justify-between'}>
              <span>Dynamic Params:</span>
              <span className={'font-mono'}>Enabled</span>
            </div>
            <div className={'flex justify-between'}>
              <span>Force Static:</span>
              <span className={'font-mono'}>Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CacheTagsCard() {
  const tags = Object.entries(ISR_TAGS);

  return (
    <div className={'rounded-lg bg-white p-6 shadow-md'}>
      <h2 className={'mb-4 text-xl font-semibold text-gray-800'}>Cache Tags</h2>
      <div className={'grid grid-cols-2 gap-2 md:grid-cols-3'}>
        {tags.map(([key, value]) => (
          <div key={key} className={'bg-gray-100 rounded p-2 text-center'}>
            <div className={'text-xs uppercase text-gray-600'}>{key}</div>
            <div className={'font-mono text-sm text-gray-800'}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebhookDemoCard() {
  return (
    <div className={'rounded-lg bg-white p-6 shadow-md'}>
      <h2 className={'mb-4 text-xl font-semibold text-gray-800'}>Webhook Integration</h2>
      <div className={'space-y-4'}>
        <div>
          <h3 className={'mb-2 font-medium text-gray-700'}>Supported Webhooks</h3>
          <div className={'space-y-2'}>
            <div className={'bg-blue-50 rounded p-3'}>
              <div className={'text-blue-800 font-medium'}>Storyblok CMS</div>
              <div className={'text-blue-600 text-sm'}>Automatic revalidation on content updates</div>
            </div>
            <div className={'bg-green-50 rounded p-3'}>
              <div className={'text-green-800 font-medium'}>Brink Commerce</div>
              <div className={'text-green-600 text-sm'}>Product and inventory updates</div>
            </div>
            <div className={'bg-orange-50 rounded p-3'}>
              <div className={'text-orange-800 font-medium'}>Manual Triggers</div>
              <div className={'text-sm text-orange-600'}>On-demand cache invalidation</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className={'mb-2 font-medium text-gray-700'}>Webhook Endpoint</h3>
          <div className={'bg-gray-100 font-mono rounded p-3 text-sm'}>POST /api/webhooks/revalidate</div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className={'animate-pulse rounded-lg bg-white p-6 shadow-md'}>
      <div className={'mb-4 h-6 w-1/3 rounded bg-gray-300'}></div>
      <div className={'space-y-3'}>
        <div className={'h-4 w-3/4 rounded bg-gray-300'}></div>
        <div className={'h-4 w-1/2 rounded bg-gray-300'}></div>
        <div className={'h-4 w-2/3 rounded bg-gray-300'}></div>
      </div>
    </div>
  );
}

export default async function ISRDemoPage() {
  const metrics = await getISRMetrics();

  return (
    <div className={'bg-gray-100 min-h-screen py-8'}>
      <div className={'container mx-auto max-w-6xl px-4'}>
        <div className={'mb-8 text-center'}>
          <h1 className={'mb-2 text-3xl font-bold text-gray-900'}>Phase 3: ISR Enhancement Demo</h1>
          <p className={'text-gray-600'}>
            Intelligent Static Generation with Advanced Cache Management for Vercel Edge Network
          </p>
        </div>

        <div className={'space-y-8'}>
          <ISRMetricsCard metrics={metrics} />

          <div className={'grid grid-cols-1 gap-8 lg:grid-cols-2'}>
            <Suspense fallback={<LoadingSkeleton />}>
              <RevalidationStrategiesCard />
            </Suspense>

            <Suspense fallback={<LoadingSkeleton />}>
              <StaticGenerationCard />
            </Suspense>
          </div>

          <div className={'grid grid-cols-1 gap-8 lg:grid-cols-2'}>
            <CacheTagsCard />
            <WebhookDemoCard />
          </div>
        </div>

        <div className={'mt-8 rounded-lg bg-white p-6 shadow-md'}>
          <h2 className={'mb-4 text-xl font-semibold text-gray-800'}>Phase 3 Enhancements</h2>
          <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
            <div>
              <h3 className={'mb-2 font-medium text-gray-700'}>🚀 Intelligent Static Generation</h3>
              <p className={'text-sm text-gray-600'}>
                Pre-generates the top 100 product pages and all category pages per locale for optimal performance.
              </p>
            </div>
            <div>
              <h3 className={'mb-2 font-medium text-gray-700'}>⏱️ Dynamic ISR Configuration</h3>
              <p className={'text-sm text-gray-600'}>
                Different revalidation strategies based on content type and update frequency requirements.
              </p>
            </div>
            <div>
              <h3 className={'mb-2 font-medium text-gray-700'}>🔄 On-Demand Revalidation</h3>
              <p className={'text-sm text-gray-600'}>
                Webhook-triggered cache invalidation for real-time content updates from CMS and commerce platforms.
              </p>
            </div>
            <div>
              <h3 className={'mb-2 font-medium text-gray-700'}>🏷️ Advanced Cache Tagging</h3>
              <p className={'text-sm text-gray-600'}>
                Granular cache invalidation using tags to update only relevant content when data changes.
              </p>
            </div>
            <div>
              <h3 className={'mb-2 font-medium text-gray-700'}>📊 Build-Time Optimization</h3>
              <p className={'text-sm text-gray-600'}>
                Intelligent static param generation with error handling and performance monitoring.
              </p>
            </div>
            <div>
              <h3 className={'mb-2 font-medium text-gray-700'}>🌐 Edge Runtime Integration</h3>
              <p className={'text-sm text-gray-600'}>
                Webhook processing on Vercel Edge Network for global, low-latency cache management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
