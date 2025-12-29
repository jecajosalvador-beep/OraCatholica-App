
import { Prayer } from './types';

export const BUILT_IN_PRAYERS: Prayer[] = [
  {
    id: 'p1',
    title: 'Our Father',
    text: `Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.`,
    type: 'Built-in',
    category: 'None',
    isFavorite: false,
    repeatType: 'Daily',
    reminderEnabled: false
  },
  {
    id: 'p2',
    title: 'Hail Mary',
    text: `Hail, Mary, full of grace, the Lord is with you; blessed are you among women, and blessed is the fruit of your womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.`,
    type: 'Built-in',
    category: 'None',
    isFavorite: false,
    repeatType: 'Daily',
    reminderEnabled: false
  },
  {
    id: 'p3',
    title: 'Glory Be (Doxology)',
    text: `Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.`,
    type: 'Built-in',
    category: 'None',
    isFavorite: false,
    repeatType: 'Daily',
    reminderEnabled: false
  },
  {
    id: 'p4',
    title: 'Prayer to Your Guardian Angel',
    text: `Angel of God, my guardian dear, to whom God's love commits me here, ever this day be at my side, to light and guard, to rule and guide. Amen.`,
    type: 'Built-in',
    category: 'None',
    isFavorite: false,
    repeatType: 'Daily',
    reminderEnabled: false
  },
  {
    id: 'p5',
    title: 'Morning Offering',
    text: `O Jesus, through the Immaculate Heart of Mary, I offer You my prayers, works, joys, and sufferings of this day for all the intentions of Your Sacred Heart, in union with the Holy Sacrifice of the Mass throughout the world, in reparation for my sins, for the intentions of all my relatives and friends, and in particular for the intentions of the Holy Father. Amen.`,
    type: 'Built-in',
    category: 'Morning',
    isFavorite: false,
    repeatType: 'Daily',
    reminderEnabled: false
  },
  {
    id: 'p6',
    title: 'Act of Contrition',
    text: `O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of thy just punishments, but most of all because they offend Thee, my God, who art all good and deserving of all my love.\n\nI firmly resolve with the help of Thy grace to sin no more and to avoid the near occasion of sin. Amen.`,
    type: 'Built-in',
    category: 'Evening',
    isFavorite: false,
    repeatType: 'Daily',
    reminderEnabled: false
  },
  {
    id: 'p7',
    title: 'Act of Faith, Hope, and Love',
    text: `O my God, I firmly believe that You are one God in three divine Persons, Father, Son, and Holy Spirit. I believe that Your divine Son became man and died for our sins and that He will come to judge the living and the dead. I believe these and all the truths which the Holy Catholic Church teaches because You have revealed them who are eternal truth and wisdom, who can neither deceive nor be deceived. In this faith I intend to live and die. Amen.\n\nO my God, relying on Your infinite goodness and promises, I hope to obtain pardon of my sins, the help of Your grace, and life everlasting, through the merits of Jesus Christ, my Lord and Redeemer. Amen.\n\nO my God, I love You above all things, with my whole heart and soul, because You are all good and worthy of all love. I love my neighbor as myself for the love of You. I forgive all who have injured me, and ask pardon of all whom I have offended. Amen.`,
    type: 'Built-in',
    category: 'None',
    isFavorite: false,
    repeatType: 'Daily',
    reminderEnabled: false
  },
  {
    id: 'p8',
    title: 'Angelus',
    text: `V. The Angel of the Lord declared unto Mary,\nR. And she conceived of the Holy Spirit.\n\nHail Mary...\n\nV. Behold the handmaid of the Lord.\nR. Be it done unto me according to thy word.\n\nHail Mary...\n\nV. And the Word was made flesh.\nR. And dwelt among us.\n\nHail Mary...\n\nV. Pray for us, O holy Mother of God.\nR. That we may be made worthy of the promises of Christ.\n\nLet us pray. Pour forth, we beseech thee, O Lord, thy grace into our hearts, that we, to whom the incarnation of Christ, thy Son, was made known by the message of an angel, may by his passion and cross be brought to the glory of his resurrection, through the same Christ our Lord. Amen.`,
    type: 'Built-in',
    category: 'None',
    isFavorite: false,
    repeatType: 'Daily',
    reminderEnabled: false
  },
  {
    id: 'p9',
    title: 'Hail, Holy Queen (Salve Regina)',
    text: `Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve: to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious Advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary! Amen.`,
    type: 'Built-in',
    category: 'Evening',
    isFavorite: false,
    repeatType: 'Daily',
    reminderEnabled: false
  },
  {
    id: 'p10',
    title: 'Chaplet of Divine Mercy',
    text: `1. Sign of the Cross\n2. Our Father\n3. Hail Mary\n4. The Apostles’ Creed\n\n5. On the Our Father bead:\nEternal Father, I offer you the Body and Blood, Soul and Divinity of Your dearly Beloved Son, Our Lord, Jesus Christ, in atonement for our sins and those of the whole world.\n\n6. On the Hail Mary beads:\nFor the sake of His sorrowful Passion, have mercy on us and on the whole world.\n\n7. Conclusion (Repeat 3 times):\nHoly God, Holy Mighty One, Holy Immortal One, have mercy on us and on the whole world.\n\n8. Optional closing prayer:\nEternal God, in whom mercy is endless and the treasury of compassion inexhaustible, look kindly upon us and increase Your mercy in us, that in difficult moments we might not despair nor become despondent, but with great confidence submit ourselves to Your holy will, which is Love and Mercy itself.`,
    type: 'Built-in',
    category: 'None',
    isFavorite: false,
    repeatType: 'Daily',
    reminderEnabled: false
  },
  {
    id: 'p11',
    title: 'Prayer to Our Lord Jesus Christ Crucified',
    text: `My good and dear Jesus, I kneel before you, asking you most earnestly to engrave upon my heart a deep and lively faith, hope, and charity, with true repentance for my sins, and a firm resolve to make amends. As I reflect upon your five wounds, and dwell upon them with deep compassion and grief, I recall, good Jesus, the words the prophet David spoke long ago concerning yourself: "They have pierced my hands and my feet; they have counted all my bones!" Amen.`,
    type: 'Built-in',
    category: 'None',
    isFavorite: false,
    repeatType: 'Daily',
    reminderEnabled: false
  }
];

export const REFLECTIONS = [
  { verse: "I am the way and the truth and the life. No one comes to the Father except through me.", ref: "John 14:6", reflect: "Today, focus on Jesus as your sole guide. Trust in His path even when the destination is unseen." },
  { verse: "Let all that you do be done in love.", ref: "1 Corinthians 16:14", reflect: "Small acts done with great love are the blocks of holiness. Seek one opportunity to show selfless love today." },
  { verse: "Be still, and know that I am God.", ref: "Psalm 46:10", reflect: "In the noise of life, silence is the language of God. Take five minutes of pure silence today to listen for His voice." },
  { verse: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1", reflect: "God provides exactly what you need for this moment. Release the anxiety of the future into His hands." }
];
