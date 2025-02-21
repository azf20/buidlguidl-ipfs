import {UploaderConfig} from 'ipfs-uploader'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

export const CONFIG_FILENAME = 'ipfs-upload.config.json'

export async function readConfig(configPath?: string): Promise<UploaderConfig | UploaderConfig[]> {
  try {
    const targetPath = configPath || join(process.cwd(), CONFIG_FILENAME)
    const configContent = await readFile(targetPath, 'utf8')
    return JSON.parse(configContent)
  } catch {
    throw new Error('Failed to read config file. Run "bgipfs upload config init" first.')
  }
}
