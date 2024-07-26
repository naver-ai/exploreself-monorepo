const synthesizeProfilicInfo = (init_nar: string, value_set: string[], background: string) => {

  return `
  The client describes one's narrative of difficulty as: "${init_nar}".
  The client ordered one's value set as: "${value_set.join(' > ')}"
  The client describes one's background as: "${background}".
  `
}

export default synthesizeProfilicInfo;