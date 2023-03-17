const home = os.homedir();

const models = [
  `${home}/Desktop/model/Model/AbyssOrangeMix2-Hardcore/abyssorangemix2_Hard.safetensors`,
  `${home}/Desktop/model/Model/Anything/anything-v4.5-pruned.safetensors`,
  `${home}/Desktop/model/Model/chilloutmix/chilloutmix_NiPrunedFp32Fix.safetensors`,
  `${home}/Desktop/model/Model/novelai/animefull-final-pruned/novelai-animefull-final-pruned.ckpt`,
  `${home}/Desktop/model/Model/perfectWorld/perfectWorld_v2Baked.safetensors`,
  `${home}/Desktop/model/Model/PVC/aoaokoPVCStyleModel_pvcAOAOKO.safetensors`,
  `${home}/Desktop/model/Model/StableDiffussion/StableDiffussion-v1-5-pruned-emaonly.ckpt`,
];

await Promise.all(
  models.map((location) => $`ln -sf ${location} ${home}/Desktop/repo/stable-diffusion-webui/models/Stable-diffusion`)
).catch(() => {});

const vaes = [
  `${home}/Desktop/model/Model/novelai/novelai-animefull-final-pruned-vae.pt`,
  `${home}/Desktop/model/Model/AbyssOrangeMix2-Hardcore/orangemix.vae.pt`,
];

await Promise.all(
  vaes.map((location) => $`ln -sf ${location} ${home}/Desktop/repo/stable-diffusion-webui/models/VAE`)
).catch(() => {});

const controlNets = [`${home}/Desktop/model/extensions/ControlNet/control_sd15_openpose.pth`];

await Promise.all(
  controlNets.map(
    (location) => $`ln -sf ${location} ${home}/Desktop/repo/stable-diffusion-webui/extensions/sd-webui-controlnet/models`
  )
).catch(() => {});

const LoRAFolder = `${home}/Desktop/model/LoRA`;
const LoRAs = (await fs.readdir(LoRAFolder))
  .filter((location) => !location.startsWith('.'))
  .map((item) => `${LoRAFolder}/${item}`);

await Promise.all(
  LoRAs.map((location) => $`ln -sf ${location} ${home}/Desktop/repo/stable-diffusion-webui/models/Lora`)
).catch(() => {});

const TextualInversionEmbeddingsFolder = `${home}/Desktop/model/TextualInversionEmbeddings`;
const TextualInversionEmbeddings = (await fs.readdir(TextualInversionEmbeddingsFolder))
  .filter((location) => !location.startsWith('.'))
  .map((item) => `${TextualInversionEmbeddingsFolder}/${item}`);

await Promise.all(
  TextualInversionEmbeddings.map(
    (location) => $`ln -sf ${location} ${home}/Desktop/repo/stable-diffusion-webui/embeddings`
  )
).catch(() => {});
