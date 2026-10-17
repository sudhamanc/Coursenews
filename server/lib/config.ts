/**
 * Secrets and late-bound settings for the Lambdas. Secrets live in SSM
 * Parameter Store as SecureStrings
 * under SSM_PREFIX (e.g. /latent-inference/ANTHROPIC_API_KEY), never in the
 * function's environment or the CloudFormation template. They are fetched
 * once per cold start and exposed as ordinary env vars, so the rest of the
 * code reads process.env as it always has. Locally SSM_PREFIX is unset and the
 * values come from .env instead.
 */
import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';

// DISTRIBUTION_ID is a plain String parameter the CDK stack writes itself.
export const SECRET_NAMES = ['ANTHROPIC_API_KEY', 'NEWS_REFRESH_KEY', 'DISTRIBUTION_ID'] as const;

let loading: Promise<void> | null = null;

export function loadSecrets(): Promise<void> {
  const prefix = process.env.SSM_PREFIX;
  if (!prefix) return Promise.resolve();
  loading ??= (async () => {
    const res = await new SSMClient({}).send(
      new GetParametersCommand({ Names: SECRET_NAMES.map((n) => `${prefix}/${n}`), WithDecryption: true }),
    );
    for (const p of res.Parameters ?? []) {
      const name = p.Name!.slice(prefix.length + 1);
      if (p.Value && !process.env[name]) process.env[name] = p.Value;
    }
    if (res.InvalidParameters?.length) console.warn('config: missing SSM parameters', res.InvalidParameters);
  })().catch((err) => {
    loading = null; // retry on the next invocation
    throw err;
  });
  return loading;
}
