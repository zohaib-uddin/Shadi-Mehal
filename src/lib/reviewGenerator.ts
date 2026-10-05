
import { supabase } from './supabase';

const PAKISTANI_NAMES = [
  "Ahmed Khan", "Sara Ali", "Zainab Bibi", "Mohammad Usman", "Ayesha Malik",
  "Bilal Sheikh", "Fatima Zahra", "Hamza Javed", "Hina Siddiqui", "Omar Farooq",
  "Nida Hassan", "Arsalan Ahmed", "Khadija Noor", "Zia Chaudhry", "Rida Shah",
  "Faisal Memon", "Sana Gul", "Adnan Qureshi", "Marium Baig", "Rizwan Lohar",
  "Tehmina Bibi", "Junaid Jamshed", "Saba Parvez", "Waqas Raja", "Anum Ijaz",
  "Shahid Afridi", "Mahira Khan", "Fawad Khan", "Sanam Said", "Atif Aslam",
  "Bakhtawar Bhutto", "Bilawal Bhutto", "Imran Khan", "Maryam Nawaz", "Shehbaz Sharif",
  "Mehwish Hayat", "Humayun Saeed", "Sajal Aly", "Ahad Raza Mir", "Yumna Zaidi",
  "Wahaj Ali", "Hania Aamir", "Iqra Aziz", "Farhan Saeed", "Urwa Hocane",
  "Mawra Hocane", "Maya Ali", "Bilal Abbas", "Feroze Khan", "Sana Javed"
];

const ADJECTIVES = [
  "Bohot achi", "Zabardast", "Kamal ki", "Premium", "Top notch", "Mind blowing",
  "Satisfied", "Excellent", "Amazing", "Outstanding", "Aala", "Behtareen",
  "Perfect", "Beautiful", "Gorgeous", "Stunning", "Elegant", "Lajawab",
  "Incredible", "Shandaar", "Classy", "Fantastic", "Modern", "Classic",
  "Unique", "Superb", "Remarkable", "Impressive", "Standard", "Authentic"
];

const NOUNS = [
  "quality", "experience", "service", "product", "delivery", "packaging",
  "dealing", "staff", "finish", "design", "results", "look", "material",
  "vibe", "setup", "arrangement", "cooperation", "professionalism", "aesthetic"
];

const VERBS = [
  "hai", "thi", "lagi", "nikli", "impress kiya", "pasand ayi", "raha", "mila",
  "dikha", "sabit hui", "mahsoos hua", "laga", "payi"
];

const PHRASES = [
  "Highly recommend karta hoon", "Must try it", "Valuable purchase", "Maza agaya",
  "Paisa wasool", "Honestly impressed", "Expectation se behtar", "Good work",
  "Keep it up", "Best in the market", "Worth every penny", "Satisfied client",
  "Will buy again", "Agli baar bhi yahin se", "Thank you so much", "Jaisa dikhaya waisa hi hay",
  "Quality me koi compromise nahi", "Staff bohot cooperative hay", "Dil khush hogaya",
  "Punctual and reliable", "Great value for money", "Professional service", "Loved the results"
];

const CONNECTORS = [
  "aur", "bilkul", "kaafi", "hamesha", "waqai", "simply", "definitely",
  "asli", "kafi had tak", "yaqeenan", "be shak"
];

export const generateUniqueComment = async (existingComments: Set<string>): Promise<string> => {
  const generate = () => {
    const r = Math.random();
    let comment = "";

    const adj = () => ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = () => NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const verb = () => VERBS[Math.floor(Math.random() * VERBS.length)];
    const phrase = () => PHRASES[Math.floor(Math.random() * PHRASES.length)];
    const conn = () => CONNECTORS[Math.floor(Math.random() * CONNECTORS.length)];

    if (r < 0.15) {
      comment = `${adj()} ${noun()} ${verb()}! ${phrase()}.`;
    } else if (r < 0.3) {
      comment = `${phrase()}, ${adj()} ${noun()}.`;
    } else if (r < 0.45) {
      comment = `${noun()} ${verb()} ${conn()} ${adj()}.`;
    } else if (r < 0.6) {
      comment = `${adj()}! ${phrase()}. ${noun()} is ${adj()}.`;
    } else if (r < 0.75) {
      comment = `Waqai ${noun()} is ${adj()} and ${phrase()}.`;
    } else if (r < 0.9) {
      comment = `${phrase()}. ${conn()} ${adj()} ${noun()}.`;
    } else {
      comment = `${adj()} ${noun()} and ${phrase()}. Simply ${adj()}.`;
    }

    return comment;
  };

  let newComment = generate();
  let attempts = 0;
  while (existingComments.has(newComment) && attempts < 50) {
    newComment = generate();
    attempts++;
  }
  return newComment;
};

export const generateAutoReviews = async (itemId: string, itemType: 'product' | 'service') => {
  try {
    // 1. Get a sample of recent comments to avoid near-term duplicates
    // We don't fetch ALL comments to avoid hitting 1000 row limit, 
    // but the generator is diverse enough that collisions are nearly impossible.
    const { data: recentReviews } = await supabase
      .from('reviews')
      .select('comment')
      .order('created_at', { ascending: false })
      .limit(500);
      
    const existingSet = new Set(recentReviews?.map(r => r.comment) || []);

    const reviewsToCreate = [];
    const count = 6 + Math.floor(Math.random() * 2); // 6 or 7 reviews

    for (let i = 0; i < count; i++) {
      const comment = await generateUniqueComment(existingSet);
      existingSet.add(comment);
      
      // Random date in early-mid 2026
      const month = Math.floor(Math.random() * 5); // 0 to 4 (Jan to May)
      const day = 1 + Math.floor(Math.random() * 27);

      const review = {
        item_id: itemId,
        user_name: PAKISTANI_NAMES[Math.floor(Math.random() * PAKISTANI_NAMES.length)],
        rating: 4 + Math.floor(Math.random() * 2), // Mostly 4 or 5 for auto-reviews
        comment: comment,
        status: 'approved',
        created_at: new Date(2026, month, day).toISOString(),
        user_id: null 
      };
      reviewsToCreate.push(review);
    }

    const { error, data } = await supabase.from('reviews').insert(reviewsToCreate).select();
    if (error) throw error;
    
    console.log(`Successfully generated ${count} reviews for item ${itemId}`);
  } catch (err) {
    console.error("Failed to generate auto reviews:", err);
  }
};

export const bulkGenerateMissingReviews = async () => {
  try {
    console.log("Starting bulk missing review generation...");
    
    // 1. Fetch ALL products and services
    const { data: products } = await supabase.from('products').select('id');
    const { data: services } = await supabase.from('services').select('id');
    
    // 2. Fetch IDs of items that ALREADY have reviews
    const { data: existingReviews } = await supabase.from('reviews').select('item_id');
    const reviewedItemIds = new Set(existingReviews?.map(r => r.item_id) || []);
    
    // 3. Filter items that need reviews
    const itemsToReview = [
      ...(products?.filter(p => !reviewedItemIds.has(p.id)).map(p => ({ id: p.id, type: 'product' as const })) || []),
      ...(services?.filter(s => !reviewedItemIds.has(s.id)).map(s => ({ id: s.id, type: 'service' as const })) || [])
    ];

    console.log(`Review Analysis: ${itemsToReview.length} out of ${ (products?.length || 0) + (services?.length || 0) } items lack reviews.`);
    
    if (itemsToReview.length === 0) return 0;

    // 4. Generate reviews sequentially to avoid DB bottlenecks
    let processedCount = 0;
    for (const item of itemsToReview) {
      await generateAutoReviews(item.id, item.type);
      processedCount++;
      // Optional: add a tiny delay to be nice to the DB
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`Bulk generation complete. Processed ${processedCount} items.`);
    return processedCount;
  } catch (err) {
    console.error("Bulk review generation failed:", err);
    throw err;
  }
};
