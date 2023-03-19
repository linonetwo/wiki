let modelHome = `E:/model`;

echo(os.type().toLowerCase());
// $.shell = 'pwsh';

const sduiHome = `E:/repo/stable-diffusion-webui-directml`;

// zx has poor support on pwsh, so we have to copy and execute manually
const outputs = []

const models = [
  `${modelHome}/Model/AbyssOrangeMix2-Hardcore/abyssorangemix2_Hard.safetensors`,
  `${modelHome}/Model/Anything/anything-v4.5-pruned.safetensors`,
  `${modelHome}/Model/chilloutmix/chilloutmix_NiPrunedFp32Fix.safetensors`,
  `${modelHome}/Model/novelai/animefull-final-pruned/novelai-animefull-final-pruned.ckpt`,
  `${modelHome}/Model/perfectWorld/perfectWorld_v2Baked.safetensors`,
  `${modelHome}/Model/PVC/aoaokoPVCStyleModel_pvcAOAOKO.safetensors`,
  `${modelHome}/Model/StableDiffussion/StableDiffussion-v1-5-pruned-emaonly.ckpt`,
];

async function symbolLink(modelRepoLocation, sduiLocation) {
  outputs.push(`New-Item -force ${sduiLocation} -ItemType SymbolicLink -Target ${modelRepoLocation}`);
}

await Promise.all(
  models.map((location) =>
    symbolLink(location, path.join(`${sduiHome}/models/Stable-diffusion`, path.basename(location)))
  )
).catch(() => {});

const vaes = [
  `${modelHome}/Model/novelai/novelai-animefull-final-pruned-vae.pt`,
  `${modelHome}/Model/AbyssOrangeMix2-Hardcore/orangemix.vae.pt`,
];
await Promise.all(
  vaes.map((location) => symbolLink(location, path.join(`${sduiHome}/models/VAE`, path.basename(location))))
).catch(() => {});

const controlNets = [`${modelHome}/extensions/ControlNet/control_sd15_openpose.pth`];
await Promise.all(
  vaes.map((location) =>
    symbolLink(location, path.join(`${sduiHome}/extensions/sd-webui-controlnet/models`, path.basename(location)))
  )
).catch(() => {});

const LoRAFolder = `${modelHome}/LoRA`;
const LoRAs = (await fs.readdir(LoRAFolder))
  .filter((location) => !location.startsWith('.'))
  .map((item) => `${LoRAFolder}/${item}`);
await Promise.all(
  LoRAs.map((location) => symbolLink(location, path.join(`${sduiHome}/models/Lora`, path.basename(location))))
).catch(() => {});

const TextualInversionEmbeddingsFolder = `${modelHome}/TextualInversionEmbeddings`;
const TextualInversionEmbeddings = (await fs.readdir(TextualInversionEmbeddingsFolder))
  .filter((location) => !location.startsWith('.'))
  .map((item) => `${TextualInversionEmbeddingsFolder}/${item}`);
await Promise.all(
  LoRAs.map((location) => symbolLink(location, path.join(`${sduiHome}/embeddings`, path.basename(location))))
).catch(() => {});

echo(`\`\`\`sh\n${outputs.join('\n')}\n\`\`\``);