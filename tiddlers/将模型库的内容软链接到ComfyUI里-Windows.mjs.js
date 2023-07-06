let modelHome = `C:/Users/linonetwo/Documents/model`;

echo(os.type().toLowerCase());
// $.shell = 'pwsh';

const sduiHome = `E:/repo/ComfyUI/models`;

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
	`${modelHome}/Model/revAnimated_v122.safetensors`,
	`${modelHome}/Model/toonyou_beta5Unstable.safetensors`,
	`${modelHome}/Model/ghostmix_v12.safetensors`,
	`${modelHome}/Model/cardosAnime_v20.safetensors`,
];

async function symbolLink(modelRepoLocation, sduiLocation) {
  outputs.push(`New-Item -force ${sduiLocation} -ItemType SymbolicLink -Target ${modelRepoLocation}`);
}

await Promise.all(
  models.map((location) =>
    symbolLink(location, path.join(`${sduiHome}/checkpoints`, path.basename(location)))
  )
).catch(() => {});

const vaes = [
  `${modelHome}/Model/novelai/novelai-animefull-final-pruned-vae.pt`,
  `${modelHome}/Model/AbyssOrangeMix2-Hardcore/orangemix.vae.pt`,
	`${modelHome}/vae/vaeFtMse840000Ema_v10.safetensors`,
];
await Promise.all(
  vaes.map((location) => symbolLink(location, path.join(`${sduiHome}/vae`, path.basename(location))))
).catch(() => {});

const controlNets = [`${modelHome}/extensions/ControlNet/control_sd15_openpose.pth`];
await Promise.all(
  controlNets.map((location) =>
    symbolLink(location, path.join(`${sduiHome}/controlnet`, path.basename(location)))
  )
).catch(() => {});

const LoRAFolder = `${modelHome}/LoRA`;
const LoRAs = (await fs.readdir(LoRAFolder))
  .filter((location) => !location.startsWith('.'))
  .map((item) => `${LoRAFolder}/${item}`);
await Promise.all(
  LoRAs.map((location) => symbolLink(location, path.join(`${sduiHome}/loras`, path.basename(location))))
).catch(() => {});

/** not supported yet
const HypernetworkFolder = `${modelHome}/hypernetworks`;
const Hypernetworks = (await fs.readdir(HypernetworkFolder))
  .filter((location) => !location.startsWith('.'))
  .map((item) => `${LoRAFolder}/${item}`);
await Promise.all(
  Hypernetworks.map((location) => symbolLink(location, path.join(`${sduiHome}/models/hypernetworks`, path.basename(location))))
).catch(() => {});
*/

const TextualInversionEmbeddingsFolder = `${modelHome}/TextualInversionEmbeddings`;
const TextualInversionEmbeddings = (await fs.readdir(TextualInversionEmbeddingsFolder))
  .filter((location) => !location.startsWith('.'))
  .map((item) => `${TextualInversionEmbeddingsFolder}/${item}`);
await Promise.all(
  TextualInversionEmbeddings.map((location) => symbolLink(location, path.join(`${sduiHome}/embeddings`, path.basename(location))))
).catch(() => {});

echo(`\`\`\`sh
${outputs.join('\n')}
\`\`\``);