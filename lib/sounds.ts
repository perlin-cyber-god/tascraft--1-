// Audio URLs (using raw GitHub content for reliability in demo)
const SOUNDS = {
  orb: 'https://github.com/kurisubrooks/minecraft-sounds/blob/master/sounds/random/orb.ogg?raw=true',
  levelup: 'https://github.com/kurisubrooks/minecraft-sounds/blob/master/sounds/random/levelup.ogg?raw=true',
  dragonDeath: 'https://github.com/kurisubrooks/minecraft-sounds/blob/master/sounds/mob/enderdragon/end.ogg?raw=true',
  click: 'https://github.com/kurisubrooks/minecraft-sounds/blob/master/sounds/random/click.ogg?raw=true'
};

export const playSound = (type: keyof typeof SOUNDS) => {
  try {
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.5;
    if (type === 'dragonDeath') audio.volume = 0.4;
    audio.play().catch(e => console.warn("Audio play failed (interaction required)", e));
  } catch (e) {
    console.error("Audio error", e);
  }
};