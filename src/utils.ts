import { exec } from 'node:child_process'
import { promisify } from 'node:util'

export async function getNpmPackageVersion(packageName: string, tag = 'latest'): Promise<string> {
  const resp = await fetch(`https://registry.npmmirror.com/${packageName}/${tag}`)
  const data = await resp.json()
  return data.version
}

export async function getCurrentYarnVersion(): Promise<string> {
  const { stdout } = await promisify(exec)('yarn -v')
  return stdout.trim()
}
