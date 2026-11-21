const key = 'bayan-curriculum-skills-v2'
const previousKey = 'bayan-curriculum-skills-v1'
const previousDefaults = [
  { id: 'speaking', title: 'التحدث', description: 'التدرّب على المحادثة والتعبير عن الأفكار بجمل واضحة.' },
  { id: 'writing', title: 'الكتابة', description: 'كتابة جمل وفقرات قصيرة باستخدام المفردات والتراكيب المدروسة.' },
  { id: 'listening', title: 'الاستماع', description: 'فهم الحوارات والنصوص المسموعة واستخراج الأفكار الرئيسة.' },
  { id: 'presentation', title: 'العرض الشفهي', description: 'إعداد عرض قصير باللغة العربية وتقديمه بوضوح وثقة.' },
]

const initialSkills = [
  { id: 'speaking', title: 'Speaking', description: 'Practise everyday conversations and express ideas clearly in Arabic.' },
  { id: 'writing', title: 'Writing', description: 'Write short sentences and paragraphs using course vocabulary and grammar.' },
  { id: 'listening', title: 'Listening', description: 'Understand spoken dialogues and identify their main ideas.' },
  { id: 'reading', title: 'Reading', description: 'Read short Arabic texts, understand their main ideas, and learn new vocabulary in context.' },
]

function migrateSkills(savedSkills) {
  // Map only surviving cards, and translate only fields that match the old defaults.
  return savedSkills.map(skill => {
    const index = previousDefaults.findIndex(item => item.id === skill.id)
    if (index < 0) return skill

    const former = previousDefaults[index]
    const current = initialSkills[index]
    const defaultTitle = skill.title === former.title
    const defaultDescription = skill.description === former.description

    if (skill.id === 'presentation') return defaultTitle && defaultDescription ? current : skill
    return {
      ...skill,
      title: defaultTitle ? current.title : skill.title,
      description: defaultDescription ? current.description : skill.description,
    }
  })
}

export function readSkills() {
  const saved = localStorage.getItem(key)
  if (saved !== null) return JSON.parse(saved)
  const previous = localStorage.getItem(previousKey)
  const skills = previous === null ? initialSkills : migrateSkills(JSON.parse(previous))
  localStorage.setItem(key, JSON.stringify(skills))
  return skills
}

function updateSkills(change) {
  const skills = change(readSkills())
  localStorage.setItem(key, JSON.stringify(skills))
  return skills
}

export function saveSkill(id, title, description) {
  const cleanTitle = title.trim()
  const cleanDescription = description.trim()
  if (!cleanTitle || !cleanDescription) throw new Error('Title and description are required.')
  return updateSkills(skills => skills.map(skill =>
    skill.id === id ? { ...skill, title: cleanTitle, description: cleanDescription } : skill))
}

export function deleteSkill(id) {
  return updateSkills(skills => skills.filter(skill => skill.id !== id))
}
