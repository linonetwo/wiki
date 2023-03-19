let modelHome = '';

echo(os.type().toLowerCase())
switch (os.type().toLowerCase()) {
  case 'darwin': {
    modelHome = `/Volumes/model`;
		break;
  }
  case 'windows_nt': {
    modelHome = `E:/model`;
		break;
  }
}

if (!modelHome) throw new Error(`modelHome not defined, os.type(): ${os.type()}`);
const sduiHome = `${os.homedir()}/Desktop/repo/stable-diffusion-webui`;

const models = [
  `${modelHome}/Model/AbyssOrangeMix2-Hardcore/abyssorangemix2_Hard.safetensors`,
  `${modelHome}/Model/Anything/anything-v4.5-pruned.safetensors`,
  `${modelHome}/Model/chilloutmix/chilloutmix_NiPrunedFp32Fix.safetensors`,
  `${modelHome}/Model/novelai/animefull-final-pruned/novelai-animefull-final-pruned.ckpt`,
  `${modelHome}/Model/perfectWorld/perfectWorld_v2Baked.safetensors`,
  `${modelHome}/Model/PVC/aoaokoPVCStyleModel_pvcAOAOKO.safetensors`,
  `${modelHome}/Model/StableDiffussion/StableDiffussion-v1-5-pruned-emaonly.ckpt`,
];

await Promise.all(models.map((location) => $`ln -sf ${location} ${sduiHome}/models/Stable-diffusion`)).catch(() => {});

const vaes = [
  `${modelHome}/Model/novelai/novelai-animefull-final-pruned-vae.pt`,
  `${modelHome}/Model/AbyssOrangeMix2-Hardcore/orangemix.vae.pt`,
];

await Promise.all(vaes.map((location) => $`ln -sf ${location} ${sduiHome}/models/VAE`)).catch(() => {});

const controlNets = [`${modelHome}/extensions/ControlNet/control_sd15_openpose.pth`];

await Promise.all(
  controlNets.map((location) => $`ln -sf ${location} ${sduiHome}/extensions/sd-webui-controlnet/models`)
).catch(() => {});

const LoRAFolder = `${modelHome}/LoRA`;
const LoRAs = (await fs.readdir(LoRAFolder))
  .filter((location) => !location.startsWith('.'))
  .map((item) => `${LoRAFolder}/${item}`);

await Promise.all(LoRAs.map((location) => $`ln -sf ${location} ${sduiHome}/models/Lora`)).catch(() => {});

const TextualInversionEmbeddingsFolder = `${modelHome}/TextualInversionEmbeddings`;
const TextualInversionEmbeddings = (await fs.readdir(TextualInversionEmbeddingsFolder))
  .filter((location) => !location.startsWith('.'))
  .map((item) => `${TextualInversionEmbeddingsFolder}/${item}`);

await Promise.all(TextualInversionEmbeddings.map((location) => $`ln -sf ${location} ${sduiHome}/embeddings`)).catch(
  () => {}
);
