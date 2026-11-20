const batchNames = {
  Saturday: ['SAT', 'Amina Rahman, Sumaiya Akter, Nusrat Jahan, Tasnim Sultana, Mariam Hossain, Hafsa Karim, Rukaiya Islam, Safiya Ahmed, Ayesha Kabir, Fatima Hasan'],
  Sunday: ['SUN', 'Nabila Chowdhury, Sadia Alam, Jannatul Ferdous, Humaira Khan, Samira Haque, Farzana Begum, Tanjina Sarker, Lamia Hoque, Khadija Noor, Naima Bashir'],
  Monday: ['MON', 'Afia Siddiqui, Sabrina Mahmud, Maliha Zaman, Sabiha Rahman, Nadia Anwar, Rafia Akter, Tanzila Yasmin, Bushra Sultana, Ishrat Jahan, Mahjabin Islam'],
  Tuesday: ['TUE', 'Fariha Ahmed, Labiba Hasan, Rida Mahjabin, Amira Hossain, Tahmina Kabir, Sharmeen Alam, Arisha Haque, Tasmia Karim, Anika Chowdhury, Tahsin Akter'],
  Wednesday: ['WED', 'Sadia Noor, Marzia Khatun, Faria Rahman, Anjum Tasnim, Rima Sultana, Sanjida Islam, Najifa Anwar, Eshita Mahmud, Sabina Haque, Shaila Yasmin'],
  Thursday: ['THU', 'Maliha Ahmed, Tanisha Hasan, Farhin Zaman, Lamisa Khan, Saima Hoque, Nuzhat Jahan, Raisa Karim, Meherun Nesa, Rumana Kabir, Muntaha Bashir'],
  Friday: ['FRI', 'Maryam Alam, Afsana Sarker, Anisa Hossain, Nazia Akter, Ruqayya Siddiqui, Areeba Chowdhury, Hasna Begum, Nafia Islam, Shifa Rahman, Roshni Noor'],
}

export const batches = Object.keys(batchNames)
export const demoRoster = Object.entries(batchNames).flatMap(([batch, [prefix, names]]) =>
  names.split(', ').map((name, index) => {
    const id = prefix + '-' + String(index + 1).padStart(3, '0')
    // Amina's existing demo attendance and tuition use her original history key.
    return { id, name, email: id.toLowerCase() + '@example.com', batch, historyId: id === 'SAT-001' ? 'AB-001' : id }
  }),
)
