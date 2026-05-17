insert into public.restaurant_settings (id, address, maps_embed) values (1, 'Jl. Pantai Berawa, Canggu, Bali', 'https://maps.google.com/maps?q=Bali&t=&z=11&ie=UTF8&iwloc=&output=embed') on conflict (id) do nothing;
insert into public.categories (name, slug, sort_order) values
('Breakfast','breakfast',1),('Main Menu','main-menu',2),('Desserts','desserts',3),('Drinks','drinks',4),('Healthy Bowl','healthy-bowl',5)
on conflict (slug) do nothing;

insert into public.menu_items (category_id, name, slug, description, price, calories, protein, fat, carbs, is_recommended, is_best_seller, is_new, is_vegan, is_gluten_free, is_spicy) values
((select id from categories where slug='breakfast'),'Amino Avocado Toast','amino-avocado-toast','Sourdough, smashed avocado, herbs, poached egg.',78000,410,16,21,42,true,true,false,false,true,false),
((select id from categories where slug='breakfast'),'Dragon Fruit Smoothie Bowl','dragon-fruit-smoothie-bowl','Pitaya, banana, granola, coconut flakes.',68000,360,9,11,62,true,false,true,true,false,false),
((select id from categories where slug='main-menu'),'Grilled Tuna Sambal Matah','grilled-tuna-sambal-matah','Fresh tuna steak with Balinese sambal and greens.',138000,520,42,23,34,true,true,false,false,false,true),
((select id from categories where slug='main-menu'),'Ubud Garden Pesto Pasta','ubud-garden-pesto-pasta','Basil pesto, cashew, roasted vegetables.',98000,640,19,30,75,false,false,false,true,false,false),
((select id from categories where slug='desserts'),'Coconut Panna Cotta','coconut-panna-cotta','Silky coconut cream, mango coulis, lime zest.',58000,310,5,18,33,false,false,true,false,false,false),
((select id from categories where slug='drinks'),'Amino Green Detox','amino-green-detox','Kale, cucumber, apple, lemon, ginger.',48000,130,3,1,30,false,false,false,true,true,false),
((select id from categories where slug='drinks'),'Golden Turmeric Latte','golden-turmeric-latte','Turmeric, oat milk, cinnamon, palm sugar.',52000,180,4,6,28,false,false,false,true,false,false),
((select id from categories where slug='healthy-bowl'),'Tempeh Protein Bowl','tempeh-protein-bowl','Tempeh, quinoa, edamame, peanut-lime dressing.',92000,590,32,24,61,true,false,false,true,true,false)
on conflict (slug) do nothing;

insert into public.gallery (image_url, caption, category, source_type) values
('/assets/gallery/placeholder-01.svg','Elegant plating','food','url'),('/assets/gallery/placeholder-02.svg','Natural ambience','interior','url') on conflict do nothing;
insert into public.reviews (name, rating, body, is_visible, verified) values
('Maya',5,'Plating cantik, bahan segar, dan ambience tenang.',true,true),('Ardi',5,'Tuna sambal matah wajib coba. Pesanan cepat dan staff ramah.',true,true) on conflict do nothing;
