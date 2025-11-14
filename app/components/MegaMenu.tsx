'use client'

import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import styles from './MegaMenu.module.css'

type Localized = {
  ru: string
  en: string
  hy: string
  ka: string
}

interface CategoryLink {
  id: string
  name: Localized
  icon: string
}

interface CategorySection {
  id: string
  title: Localized
  items: CategoryLink[]
}

interface Category {
  id: string
  name: Localized
  icon: string
  sections: CategorySection[]
}

const text = (ru: string, en: string, hy: string, ka: string): Localized => ({
  ru,
  en,
  hy,
  ka,
})

const categories: Category[] = [
  {
    id: 'electronics',
    name: text('Электроника', 'Electronics', 'Էլեկտրոնիկա', 'ელექტრონიკა'),
    icon: '📱',
    sections: [
      {
        id: 'smart-devices',
        title: text('Умные гаджеты', 'Smart devices', 'Խելացի սարքեր', 'ჭკვიანი მოწყობილობები'),
        items: [
          { id: 'smartphones', name: text('Смартфоны', 'Smartphones', 'Սմարթֆոններ', 'სმარტფონები'), icon: '📱' },
          { id: 'tablets', name: text('Планшеты', 'Tablets', 'Պլանշետներ', 'პლანშეტები'), icon: '📲' },
          { id: 'wearables', name: text('Носимая электроника', 'Wearables', 'Կրելի տեխնիկա', 'სმარტ-საათები'), icon: '⌚' },
          { id: 'smarthome', name: text('Умный дом', 'Smart home', 'Խելացի տուն', 'ჭკვიანი სახლი'), icon: '🏠' },
        ],
      },
      {
        id: 'computing',
        title: text('Компьютеры и офис', 'Computers & office', 'Համակարգիչներ', 'კომპიუტერები'),
        items: [
          { id: 'laptops', name: text('Ноутбуки', 'Laptops', 'Դյուրակիրներ', 'ლეპტოპები'), icon: '💻' },
          { id: 'desktops', name: text('Настольные ПК', 'Desktops', 'Սեղանի ПК', 'დესკტოპები'), icon: '🖥️' },
          { id: 'monitors', name: text('Мониторы', 'Monitors', 'Մոնիտորներ', 'მონიტორები'), icon: '🖼️' },
          { id: 'components', name: text('Компоненты', 'Components', 'Կոմպոնենտներ', 'კომპონენტები'), icon: '🧩' },
        ],
      },
      {
        id: 'entertainment',
        title: text('Развлечения и медиа', 'Entertainment & media', 'Ժամանց', 'გართობა'),
        items: [
          { id: 'televisions', name: text('Телевизоры', 'Televisions', 'Հեռուստացույցներ', 'ტელევიზორები'), icon: '📺' },
          { id: 'audio', name: text('Аудиосистемы', 'Audio systems', 'Ձայնային համակարգեր', 'აუდიო სისტემები'), icon: '🔊' },
          { id: 'gaming', name: text('Игровые приставки', 'Gaming', 'Խաղային կոնսոլներ', 'გეიმინგი'), icon: '🎮' },
          { id: 'cameras', name: text('Фото и видео', 'Photo & video', 'Լուսանկար և վիդեո', 'ფოტო და ვიდეო'), icon: '📷' },
        ],
      },
    ],
  },
  {
    id: 'home-living',
    name: text('Дом и кухня', 'Home & kitchen', 'Տուն և խոհանոց', 'სახლი და სამზარეულო'),
    icon: '🏡',
    sections: [
      {
        id: 'kitchen',
        title: text('Кухня', 'Kitchen', 'Խոհանոց', 'სამზარეულო'),
        items: [
          { id: 'cookware', name: text('Посуды и кастрюли', 'Cookware', 'Կաթսաներ', 'ქვაბები'), icon: '🍳' },
          { id: 'appliances', name: text('Бытовая техника', 'Appliances', 'Կենցաղային սարքեր', 'ტექნიკა'), icon: '🍞' },
          { id: 'storage', name: text('Хранение', 'Storage', 'Պահեստավորում', 'შენახვა'), icon: '🥡' },
          { id: 'tabletop', name: text('Сервировка стола', 'Tabletop', 'Սեղանի սպասք', 'სერვირება'), icon: '🍽️' },
        ],
      },
      {
        id: 'home-comfort',
        title: text('Домашний уют', 'Home comfort', 'Տնային հարմարավետություն', 'სახლი და კომფორტი'),
        items: [
          { id: 'furniture', name: text('Мебель', 'Furniture', 'Կահույք', 'ავეჯი'), icon: '🛋️' },
          { id: 'decor', name: text('Декор и свет', 'Decor & lighting', 'Դեկոր և լուսավորում', 'დეკორი და განათება'), icon: '🕯️' },
          { id: 'textiles', name: text('Текстиль', 'Textiles', 'Տեքստիլ', 'ტექստილი'), icon: '🛏️' },
          { id: 'organizers', name: text('Органайзеры', 'Organizers', 'Կազմակերպիչներ', 'ორგანაიზერები'), icon: '🗂️' },
        ],
      },
      {
        id: 'garden',
        title: text('Сад и двор', 'Garden & outdoor', 'Այգի և բակ', 'ბაღი და ეზო'),
        items: [
          { id: 'tools', name: text('Инструменты', 'Tools', 'Գործիքներ', 'ინსტრუმენტები'), icon: '🛠️' },
          { id: 'outdoor-furniture', name: text('Уличная мебель', 'Outdoor furniture', 'Արտաքին կահույք', 'გარე ავეჯი'), icon: '🪑' },
          { id: 'grills', name: text('Грили и BBQ', 'Grills & BBQ', 'Գրիլ', 'გრილები'), icon: '🍖' },
          { id: 'plants', name: text('Растения и уход', 'Plants & care', 'Բույսեր և խնամք', 'მცენარეები'), icon: '🌿' },
        ],
      },
    ],
  },
  {
    id: 'fashion',
    name: text('Мода', 'Fashion', 'Նորաձևություն', 'მოდა'),
    icon: '👗',
    sections: [
      {
        id: 'women',
        title: text('Для женщин', 'Women', 'Կանանց', 'ქალები'),
        items: [
          { id: 'dresses', name: text('Платья', 'Dresses', 'Զգեստներ', 'კაბები'), icon: '👗' },
          { id: 'women-shoes', name: text('Обувь', 'Shoes', 'Կոշիկներ', 'ფეხსაცმელი'), icon: '👠' },
          { id: 'bags', name: text('Сумки', 'Bags', 'Պայուսակներ', 'ჩანთები'), icon: '👜' },
          { id: 'accessories-women', name: text('Украшения', 'Jewelry & accessories', 'Զարդեր', 'აქსესუარები'), icon: '💍' },
        ],
      },
      {
        id: 'men',
        title: text('Для мужчин', 'Men', 'Տղամարդկանց', 'კაცები'),
        items: [
          { id: 'shirts', name: text('Рубашки', 'Shirts', 'Վերարկուներ', 'პერანგები'), icon: '👔' },
          { id: 'outerwear', name: text('Верхняя одежда', 'Outerwear', 'Վերարկու', 'ზედა ტანსაცმელი'), icon: '🧥' },
          { id: 'men-shoes', name: text('Обувь', 'Footwear', 'Կոշիկներ', 'ფეხსაცმელი'), icon: '👟' },
          { id: 'accessories-men', name: text('Аксессуары', 'Accessories', 'Աքսեսուարներ', 'აქსესუარები'), icon: '🧢' },
        ],
      },
      {
        id: 'kids',
        title: text('Дети и малыши', 'Kids & baby', 'Մանկական', 'ბავშვები'),
        items: [
          { id: 'baby', name: text('Одежда для малышей', 'Baby apparel', 'Մանկական հագուստ', 'ჩვილთა ტანსაცმელი'), icon: '🍼' },
          { id: 'school', name: text('Школа', 'School style', 'Դպրոցական', 'სკოლის ფორმა'), icon: '🎒' },
          { id: 'sportswear', name: text('Спортивная одежда', 'Sportswear', 'Սպորտային հագուստ', 'სპორტული ტანსაცმელი'), icon: '⚽' },
          { id: 'family-look', name: text('Family look', 'Family sets', 'Ընտանեկան հավաքածու', 'ფემილი ლუქი'), icon: '👨‍👩‍👧' },
        ],
      },
    ],
  },
  {
    id: 'beauty-wellness',
    name: text('Красота и здоровье', 'Beauty & wellness', 'Գեղեցկություն և առողջություն', 'სილამაზე და ჯანმრთელობა'),
    icon: '💄',
    sections: [
      {
        id: 'skincare',
        title: text('Уход за кожей', 'Skincare', 'Մաշկի խնամք', 'კანის მოვლა'),
        items: [
          { id: 'cleansers', name: text('Очищение', 'Cleansers', 'Մաքրողներ', 'საწმენდი'), icon: '🧴' },
          { id: 'serums', name: text('Сыворотки', 'Serums', 'Շիճուկներ', 'სერუმები'), icon: '💧' },
          { id: 'spf', name: text('SPF защита', 'SPF care', 'Արևապաշտպան', 'SPF დაცვა'), icon: '🌤️' },
          { id: 'masks', name: text('Маски', 'Masks', 'Դիմակներ', 'ნიღბები'), icon: '🧖' },
        ],
      },
      {
        id: 'haircare',
        title: text('Волосы', 'Hair care', 'Մազերի խնամք', 'თმის მოვლა'),
        items: [
          { id: 'shampoo', name: text('Шампуни', 'Shampoo', 'Շամպուններ', 'შამპუნები'), icon: '🧴' },
          { id: 'styling', name: text('Стайлинг', 'Styling', 'Ստայլինգ', 'სტაილინგი'), icon: '💇' },
          { id: 'tools-hair', name: text('Приборы', 'Hair tools', 'Մազերի սարքեր', 'თმის տեխնიკა'), icon: '🌀' },
          { id: 'treatments-hair', name: text('Масла и маски', 'Oils & masks', 'Յուղեր և դիմակներ', 'ზეთები'), icon: '🛢️' },
        ],
      },
      {
        id: 'wellness',
        title: text('Самочувствие', 'Wellness', 'Լավ ինքնազգացում', 'ველნესი'),
        items: [
          { id: 'vitamins', name: text('Витамины', 'Vitamins', 'Վիտամիններ', 'ვიტამინები'), icon: '💊' },
          { id: 'massage', name: text('Массаж и релакс', 'Massage & relax', 'Մերսիչներ', 'მასაჟი'), icon: '💆' },
          { id: 'personal-care', name: text('Гигиена', 'Personal care', 'Հիգիենա', 'ჰიგიენა'), icon: '🧼' },
          { id: 'sleep', name: text('Сон и отдых', 'Sleep & rest', 'Քուն և հանգիստ', 'ძილი და განტვირთვა'), icon: '😴' },
        ],
      },
    ],
  },
  {
    id: 'baby-play',
    name: text('Малыши и игры', 'Baby & play', 'Մանկական և խաղալիքներ', 'ბავშვები და თამაში'),
    icon: '🧸',
    sections: [
      {
        id: 'nursery',
        title: text('Комната малыша', 'Nursery', 'Մանկասենյակ', 'ბავშვის ოთახი'),
        items: [
          { id: 'cribs', name: text('Кроватки', 'Cribs', 'Մանկական մահճակալ', 'საწოლები'), icon: '🛏️' },
          { id: 'strollers', name: text('Коляски', 'Strollers', 'Մանկասայլակներ', 'ეტლები'), icon: '🛒' },
          { id: 'car-seats', name: text('Автокресла', 'Car seats', 'Ավտոսեդեր', 'ავტოსავარძლები'), icon: '🚗' },
          { id: 'safety', name: text('Безопасность', 'Safety', 'Անվտանգություն', 'უსაფრთხოება'), icon: '🛡️' },
        ],
      },
      {
        id: 'learning',
        title: text('Обучение', 'Learning', 'Սովորում', 'სწავლა'),
        items: [
          { id: 'books-kids', name: text('Детские книги', 'Kids books', 'Մանկական գրքեր', 'საბავშვო წიგნები'), icon: '📚' },
          { id: 'stem', name: text('STEM наборы', 'STEM kits', 'STEM հավաքածուներ', 'STEM კიტები'), icon: '🧪' },
          { id: 'music-toys', name: text('Музыкальные игрушки', 'Music toys', 'Երաժշտական խաղալիքներ', 'მუსიკალური სათამაშოები'), icon: '🎹' },
          { id: 'crafts', name: text('Творчество', 'Arts & crafts', 'Ստեղծագործություն', 'ხელოვნება'), icon: '🎨' },
        ],
      },
      {
        id: 'playtime',
        title: text('Игровое время', 'Playtime', 'Խաղի ժամանակ', 'თამაშის დრო'),
        items: [
          { id: 'building', name: text('Конструкторы', 'Building sets', 'Կոնստրուկտորներ', 'კონსტრუქტორები'), icon: '🧱' },
          { id: 'plush', name: text('Мягкие игрушки', 'Plush toys', 'Փափուկ խաղալիքներ', 'რბილი სათამაშოები'), icon: '🧸' },
          { id: 'outdoor-toys', name: text('Уличные игры', 'Outdoor toys', 'Արտաքին խաղեր', 'გარე სათამაშოები'), icon: '🛴' },
          { id: 'boardgames', name: text('Настольные игры', 'Board games', 'Սեղանի խաղեր', 'მაგიდის თამაშები'), icon: '🎲' },
        ],
      },
    ],
  },
  {
    id: 'sports-outdoors',
    name: text('Спорт и отдых', 'Sports & outdoors', 'Սպորտ և բացօթյա', 'სპორტი და გარეთ'),
    icon: '⚽',
    sections: [
      {
        id: 'fitness',
        title: text('Фитнес', 'Fitness', 'Ֆիթնես', 'ფიტნესი'),
        items: [
          { id: 'strength', name: text('Силовые тренажеры', 'Strength', 'Ուժային սարքեր', 'ძალის ტრენაჟორები'), icon: '🏋️' },
          { id: 'cardio', name: text('Кардио', 'Cardio', 'Կարդիո', 'კარდიო'), icon: '🚴' },
          { id: 'yoga', name: text('Йога и пилатес', 'Yoga & pilates', 'Յոգա', 'იოგა'), icon: '🧘' },
          { id: 'recovery', name: text('Восстановление', 'Recovery', 'Վերականգնում', 'რეაბილიტაცია'), icon: '🧊' },
        ],
      },
      {
        id: 'outdoor',
        title: text('Туризм и приключения', 'Outdoor adventure', 'Բացօթյա արկածներ', 'გარე თავგადასავალი'),
        items: [
          { id: 'camping', name: text('Кемпинг', 'Camping', 'Քեմփինգ', 'კემპინგი'), icon: '🏕️' },
          { id: 'hiking', name: text('Походы', 'Hiking', 'Արշավներ', 'ლაშქრობა'), icon: '🥾' },
          { id: 'climbing', name: text('Альпинизм', 'Climbing', 'Լեռնագնացություն', 'ალპინისტიკა'), icon: '🧗' },
          { id: 'water-sports', name: text('Водные виды', 'Water sports', 'Ջրային սպորտ', 'წყლის სპორტი'), icon: '🏄' },
        ],
      },
      {
        id: 'seasonal',
        title: text('Сезонные подборки', 'Seasonal picks', 'Սեզոնային հավաքածու', 'სეზონური'),
        items: [
          { id: 'winter-sports', name: text('Зимние виды спорта', 'Winter sports', 'Ձմեռային', 'ზამთრის სპორტი'), icon: '🎿' },
          { id: 'summer-beach', name: text('Лето и пляж', 'Summer & beach', 'Ամառ և пляж', 'ზღვის სეზონი'), icon: '🏖️' },
          { id: 'fan-shop', name: text('Fan shop', 'Fan shop', 'Ֆան խանութ', 'ფენ-შოპი'), icon: '🏟️' },
          { id: 'mobility', name: text('Электротранспорт', 'Electric mobility', 'Էլեկտրատրանսպորտ', 'ელექტრო ტრანსპორტი'), icon: '🛴' },
        ],
      },
    ],
  },
  {
    id: 'automotive',
    name: text('Авто и инструменты', 'Automotive & tools', 'Ավտո և գործիքներ', 'ავტო და ინსტრუმენტები'),
    icon: '🚗',
    sections: [
      {
        id: 'parts',
        title: text('Запчасти', 'Replacement parts', 'Պահեստամասեր', 'ნაწილები'),
        items: [
          { id: 'brakes', name: text('Тормоза', 'Brakes', 'Ապրակներ', 'მუხრუჭები'), icon: '🛑' },
          { id: 'filters', name: text('Фильтры', 'Filters', 'Ֆիլտրեր', 'ფილტრები'), icon: '🧽' },
          { id: 'lighting-auto', name: text('Освещение', 'Lighting', 'Լուսավորում', 'ფარები'), icon: '🔦' },
          { id: 'tires', name: text('Шины и диски', 'Tires & wheels', 'Անիվներ', 'ბორბლები'), icon: '🛞' },
        ],
      },
      {
        id: 'car-care',
        title: text('Уход за авто', 'Car care', 'Ավտո խնամք', 'ავტო მოვლა'),
        items: [
          { id: 'cleaning', name: text('Химия и очистка', 'Cleaning', 'Մաքրում', 'დასუფთავება'), icon: '🧴' },
          { id: 'diagnostics', name: text('Диагностика', 'Diagnostics', 'Ախտորոշում', 'დიაგნოსტიკა'), icon: '📟' },
          { id: 'tools-auto', name: text('Инструменты', 'Tools', 'Գործիքներ', 'ინსტრუმენტები'), icon: '🧰' },
          { id: 'safety-auto', name: text('Безопасность', 'Safety', 'Անվտանգություն', 'უსაფრთხოება'), icon: '🦺' },
        ],
      },
      {
        id: 'accessories-auto',
        title: text('Аксессуары', 'Accessories', 'Աքսեսուարներ', 'აქსესუარები'),
        items: [
          { id: 'interior', name: text('Интерьер и уют', 'Interior', 'Ներքին', 'ინტერიერი'), icon: '🪑' },
          { id: 'electronics-auto', name: text('Электроника', 'Car electronics', 'Էլեկտրոնիկա', 'ელექტრონიკა'), icon: '📡' },
          { id: 'travel-auto', name: text('Путешествия', 'Travel gear', 'Ճամփորդություն', 'მოგზაურობა'), icon: '🧳' },
          { id: 'powersports', name: text('Пауэрспорт', 'Powersports', 'Հզոր սպորտ', 'ძალოვანი სპორტი'), icon: '🏍️' },
        ],
      },
    ],
  },
  {
    id: 'grocery',
    name: text('Продукты', 'Grocery & gourmet', 'Մթերք', 'სურსათო'),
    icon: '🛒',
    sections: [
      {
        id: 'pantry',
        title: text('Запасы', 'Pantry staples', 'Պաշարներ', 'საწყობი'),
        items: [
          { id: 'grains', name: text('Крупы и паста', 'Grains & pasta', 'Հացահատիկ', 'ბურღული'), icon: '🍚' },
          { id: 'oils', name: text('Масла и специи', 'Oils & spices', 'Յուղեր և համեմունքներ', 'ზეთი და სანელებლები'), icon: '🧂' },
          { id: 'canned', name: text('Консервы', 'Canned food', 'Պահածոներ', 'კონსერვები'), icon: '🥫' },
          { id: 'breakfast', name: text('Завтрак', 'Breakfast', 'Նախաճաշ', 'საუზმე'), icon: '🥣' },
        ],
      },
      {
        id: 'beverages',
        title: text('Напитки', 'Beverages', 'Խմիչքներ', 'სასმელები'),
        items: [
          { id: 'coffee', name: text('Кофе', 'Coffee', 'Սուրճ', 'ყავა'), icon: '☕' },
          { id: 'tea', name: text('Чай', 'Tea', 'Թեյ', 'ჩაი'), icon: '🍵' },
          { id: 'juices', name: text('Соки', 'Juices', 'Հյութեր', 'წვენები'), icon: '🧃' },
          { id: 'energy', name: text('Энергетики', 'Energy drinks', 'Էներգետիկ', 'ენერგეტიკები'), icon: '⚡' },
        ],
      },
      {
        id: 'snacks',
        title: text('Перекусы и сладости', 'Snacks & sweets', 'Խորտիկներ', 'სნეკები'),
        items: [
          { id: 'chips', name: text('Чипсы и попкорн', 'Chips & popcorn', 'Չիպսեր', 'ჩიფსები'), icon: '🍿' },
          { id: 'nuts', name: text('Орехи и сухофрукты', 'Nuts & dried fruit', 'Ընկույզներ', 'თხილეული'), icon: '🥜' },
          { id: 'chocolate', name: text('Шоколад и конфеты', 'Chocolate & candy', 'Շոկոլադ', 'შოკოლადი'), icon: '🍫' },
          { id: 'protein', name: text('Протеиновые батончики', 'Protein bars', 'Սպիտակուցային բատոններ', 'პროტეინის բარები'), icon: '🍫' },
        ],
      },
    ],
  },
  {
    id: 'books-media',
    name: text('Книги и медиа', 'Books & media', 'Գրքեր և մեդիա', 'წიგნები და მედია'),
    icon: '📚',
    sections: [
      {
        id: 'literature',
        title: text('Литература', 'Literature', 'Գրականություն', 'ლიტერატურა'),
        items: [
          { id: 'fiction', name: text('Художественная', 'Fiction', 'Գեղարվեստական', 'მხატვრული'), icon: '📖' },
          { id: 'nonfiction', name: text('Нехудожественная', 'Non-fiction', 'Գիտական', 'არამხატვრული'), icon: '📘' },
          { id: 'comics', name: text('Комиксы и графика', 'Comics & manga', 'Կոմիքսներ', 'კომიქսები'), icon: '📙' },
          { id: 'audiobooks', name: text('Аудиокниги', 'Audiobooks', 'Աուդիոգրքեր', 'აუდიოწიგნები'), icon: '🎧' },
        ],
      },
      {
        id: 'education',
        title: text('Обучение', 'Education', 'Կրթություն', 'განათლება'),
        items: [
          { id: 'textbooks', name: text('Учебники', 'Textbooks', 'Դասագրքեր', 'სასწავლო წიგნები'), icon: '📚' },
          { id: 'languages', name: text('Языки', 'Languages', 'Լեզուներ', 'ენები'), icon: '🗣️' },
          { id: 'business', name: text('Бизнес и карьера', 'Business & career', 'Բիզնես', 'ბიზნესი'), icon: '💼' },
          { id: 'certifications', name: text('Курсы и сертификаты', 'Courses & certifications', 'Դասընթացներ', 'კურსები'), icon: '📜' },
        ],
      },
      {
        id: 'media',
        title: text('Развлечения', 'Entertainment', 'Ժամանց', 'გართობა'),
        items: [
          { id: 'movies', name: text('Фильмы и видео', 'Movies & video', 'Ֆիլմեր', 'ფილმები'), icon: '🎬' },
          { id: 'music', name: text('Музыка', 'Music', 'Երաժշտություն', 'მუსიკა'), icon: '🎵' },
          { id: 'streaming', name: text('Стриминг и подписки', 'Streaming & subscriptions', 'Սթրիմինգ', 'სტრიმინგი'), icon: '📺' },
          { id: 'gift-cards', name: text('Подарочные карты', 'Gift cards', 'Նվեր քարտեր', 'სასაჩუქრე ბარათები'), icon: '🎁' },
        ],
      },
    ],
  },
  {
    id: 'pet-supplies',
    name: text('Зоотовары', 'Pet supplies', 'Կենդանիների համար', 'ცხოველებისთვის'),
    icon: '🐾',
    sections: [
      {
        id: 'dogs',
        title: text('Собаки', 'Dogs', 'Շուներ', 'ძაღლები'),
        items: [
          { id: 'dog-food', name: text('Корм', 'Food', 'Կեր', 'საკვები'), icon: '🥩' },
          { id: 'dog-toys', name: text('Игрушки', 'Toys', 'Խաղալիքներ', 'სათამაშოები'), icon: '🦴' },
          { id: 'dog-care', name: text('Уход и груминг', 'Grooming & care', 'Խնամք', 'მოვლა'), icon: '🧴' },
          { id: 'dog-travel', name: text('Перевозки', 'Travel', 'Ճամփորդություն', 'მოგზაურობა'), icon: '🚙' },
        ],
      },
      {
        id: 'cats',
        title: text('Кошки', 'Cats', 'Կատուներ', 'კატები'),
        items: [
          { id: 'cat-food', name: text('Корм', 'Food', 'Կեր', 'საკვები'), icon: '🐟' },
          { id: 'litter', name: text('Лотки и наполнитель', 'Litter & care', 'Աղբաման', 'ლიტერი'), icon: '🚽' },
          { id: 'cat-toys', name: text('Игрушки', 'Toys', 'Խաղալիքներ', 'სათამაშოები'), icon: '🧶' },
          { id: 'cat-health', name: text('Здоровье', 'Health', 'Առողջություն', 'ჯანმრთელობა'), icon: '🩺' },
        ],
      },
      {
        id: 'aquatic',
        title: text('Аквариум и малыши', 'Aquatic & small pets', 'Ջրային և փոքր կենդանիներ', 'წყლისა და მცირე ცხოველები'),
        items: [
          { id: 'tanks', name: text('Аквариумы', 'Aquariums', 'Ակվարիումներ', 'აქცორი'), icon: '🐠' },
          { id: 'equipment', name: text('Оборудование', 'Equipment', 'Սարքավորումներ', 'დანადგარები'), icon: '⚙️' },
          { id: 'decor-aqua', name: text('Декор и растения', 'Decor & plants', 'Դեկոր', 'დეკორი'), icon: '🏝️' },
          { id: 'care-aqua', name: text('Уход и питание', 'Care & nutrition', 'Խնամք', 'მოვლა'), icon: '🧽' },
        ],
      },
    ],
  },
  {
    id: 'industrial-scientific',
    name: text('Промышленность и наука', 'Industrial & scientific', 'Արդյունաբերություն և գիտություն', 'მრეწველობა და მეცნიერება'),
    icon: '🔬',
    sections: [
      {
        id: 'lab-equipment',
        title: text('Лабораторное оборудование', 'Lab equipment', 'Լաբորատոր սարքավորումներ', 'ლაბორატორიული მოწყობილობა'),
        items: [
          { id: 'microscopes', name: text('Микроскопы', 'Microscopes', 'Միկրոսկոպներ', 'მიკროსკოპები'), icon: '🔬' },
          { id: 'glassware', name: text('Колбы и посуда', 'Glassware', 'Լաբորատոր ապակեղեն', 'ლაბორატორიული ჭურჭელი'), icon: '🧪' },
          { id: 'safety-gear', name: text('Защитное снаряжение', 'Safety gear', 'Անվտանգության միջոցներ', 'უსაფრთხოების აღჭურვილობა'), icon: '🦺' },
          { id: 'chemicals', name: text('Реактивы и химия', 'Chemicals', 'Քիմիական նյութեր', 'ქიმიკატები'), icon: '⚗️' },
        ],
      },
      {
        id: 'test-measure',
        title: text('Измерение и тесты', 'Test & measurement', 'Չափում և թեստ', 'გაზომვა და ტესტირება'),
        items: [
          { id: 'multimeters', name: text('Мультиметры', 'Multimeters', 'Մուլտիմետրեր', 'მულტიმეტრები'), icon: '📏' },
          { id: 'sensors', name: text('Датчики', 'Sensors', 'Սենսորներ', 'სენსორები'), icon: '📡' },
          { id: 'calibrators', name: text('Калибраторы', 'Calibrators', 'Կալիբրատորներ', 'კალიბრატორები'), icon: '🧭' },
          { id: 'inspection', name: text('Осмотр и диагностика', 'Inspection tools', 'Ստուգիչ գործիքներ', 'ინსპექციის ხელსაწყოები'), icon: '🔍' },
        ],
      },
      {
        id: 'power-transmission',
        title: text('Энергия и приводы', 'Power transmission', 'Էներգիայի փոխանցում', 'ენერგიის გადაცემა'),
        items: [
          { id: 'motors', name: text('Двигатели', 'Motors', 'Շարժիչներ', 'ძრავები'), icon: '⚙️' },
          { id: 'pumps', name: text('Насосы', 'Pumps', 'Պոմպեր', 'ტუმბოები'), icon: '💧' },
          { id: 'valves', name: text('Клапаны', 'Valves', 'Փականներ', 'სარქველები'), icon: '🚰' },
          { id: 'bearings', name: text('Подшипники', 'Bearings', 'Առանցքակալներ', 'საკისრები'), icon: '🛞' },
        ],
      },
    ],
  },
  {
    id: 'handmade',
    name: text('Ручная работа', 'Handmade', 'Ձեռագործ', 'ხელნაკეთი'),
    icon: '🎨',
    sections: [
      {
        id: 'handmade-jewelry',
        title: text('Украшения', 'Jewelry', 'Զարդեր', 'ძვირფასეულობა'),
        items: [
          { id: 'necklaces', name: text('Ожерелья', 'Necklaces', 'Վզնոցներ', 'ყელსაბამები'), icon: '📿' },
          { id: 'earrings', name: text('Серьги', 'Earrings', 'Ականջօղեր', 'საყურეები'), icon: '👂' },
          { id: 'bracelets', name: text('Браслеты', 'Bracelets', 'Թևնոցներ', 'სამაჯურები'), icon: '🔗' },
          { id: 'rings', name: text('Кольца', 'Rings', 'Մատանիներ', 'ბეჭდები'), icon: '💍' },
        ],
      },
      {
        id: 'handmade-decor',
        title: text('Декор для дома', 'Home decor', 'Տնային դեկոր', 'სახლის დეკორი'),
        items: [
          { id: 'paintings', name: text('Картины и постеры', 'Paintings & prints', 'Նկարներ և պաստառներ', 'ფერწერა და პოსტერები'), icon: '🖼️' },
          { id: 'ceramics', name: text('Керамика и посуда', 'Ceramics', 'Կերամիկա', 'კერამიკა'), icon: '🏺' },
          { id: 'candles', name: text('Свечи и ароматы', 'Candles & scents', 'Մոմեր և সুবासներ', 'სანთლები და არომატები'), icon: '🕯️' },
          { id: 'textiles-handmade', name: text('Текстиль и пледы', 'Textiles', 'Տեքստիլ', 'ტექსტილი'), icon: '🧵' },
        ],
      },
      {
        id: 'handmade-fashion',
        title: text('Одежда и аксессуары', 'Clothing & accessories', 'Հագուստ և աքսեսուարներ', 'ტანსაცმელი და აქსესუარები'),
        items: [
          { id: 'knitwear', name: text('Вязаные вещи', 'Knitwear', 'Ներկառուցած հագուստ', 'ნაქსოვი ნივთები'), icon: '🧶' },
          { id: 'bags-handmade', name: text('Сумки и кошельки', 'Bags & wallets', 'Պայուսակներ և դրամապանակներ', 'ჩანთები და საფულეები'), icon: '👜' },
          { id: 'scarves', name: text('Шарфы и платки', 'Scarves & shawls', 'Շալեր', 'შალები'), icon: '🧣' },
          { id: 'hair-accessories', name: text('Аксессуары для волос', 'Hair accessories', 'Մազերի աքսեսուարներ', 'თმის აქსესუარები'), icon: '🎀' },
        ],
      },
    ],
  },
  {
    id: 'office-supplies',
    name: text('Офис и школа', 'Office & school', 'Օֆիս և դպրոց', 'ოფისი და სკოლა'),
    icon: '🗂️',
    sections: [
      {
        id: 'work-essentials',
        title: text('Рабочие аксессуары', 'Work essentials', 'Աշխատանքային պարագաներ', 'სამუშაო აქსესუარები'),
        items: [
          { id: 'notebooks', name: text('Блокноты и дневники', 'Notebooks & journals', 'Նոթատետրեր', 'ბლოკნოტები'), icon: '📓' },
          { id: 'writing', name: text('Ручки и маркеры', 'Pens & markers', 'Գրիչներ և մարկերներ', 'წერადი და მარკერები'), icon: '🖊️' },
          { id: 'desk-accessories', name: text('Органайзеры и подставки', 'Desk accessories', 'Սեղանի աքսեսուարներ', 'საგარეო აქსესუარები'), icon: '📎' },
          { id: 'planners', name: text('Планеры и календари', 'Planners & calendars', 'Պլաներներ', 'პლანერები'), icon: '📅' },
        ],
      },
      {
        id: 'school-gear',
        title: text('Для учебы', 'School gear', 'Դպրոցական պարագաներ', 'სკოლის აქსესუარები'),
        items: [
          { id: 'backpacks-school', name: text('Рюкзаки и сумки', 'Backpacks & bags', 'Դպրոցական պայուսակներ', 'სკოლის ჩანთები'), icon: '🎒' },
          { id: 'art-supplies', name: text('Краски и творчество', 'Art supplies', 'Նկարչական պարագաներ', 'საფერწერკო მასალა'), icon: '🎨' },
          { id: 'math-tools', name: text('Линейки и инструменты', 'Math tools', 'Չափման գործիքներ', 'საზომი ხელსაწყოები'), icon: '📐' },
          { id: 'kids-desks', name: text('Парта и стул', 'Desks & chairs', 'Գրասեղաններ', 'მაგიდები და სკამები'), icon: '🪑' },
        ],
      },
      {
        id: 'printing-tech',
        title: text('Печать и техника', 'Printing & tech', 'Տպագիր սարքեր', 'ბეჭდვა და ტექნიკა'),
        items: [
          { id: 'printers', name: text('Принтеры', 'Printers', 'Տպիչներ', 'პრინტერები'), icon: '🖨️' },
          { id: 'ink-toner', name: text('Чернила и картриджи', 'Ink & toner', 'Թանաքներ և քարտրիջներ', 'მელანი და კარტრიჯი'), icon: '🧴' },
          { id: 'laminators', name: text('Ламинаторы и резаки', 'Laminators & cutters', 'Լամինատորներ', 'ლამინატორები'), icon: '✂️' },
          { id: 'label-makers', name: text('Этикетки и маркировка', 'Label makers', 'Պիտակավորիչներ', 'ლეიბლერები'), icon: '🏷️' },
        ],
      },
    ],
  },
  {
    id: 'tools-home-improvement',
    name: text('Инструменты и ремонт', 'Tools & home improvement', 'Գործիքներ և վերանորոգում', 'ინსტრუმენტები და რემონტი'),
    icon: '🛠️',
    sections: [
      {
        id: 'power-tools',
        title: text('Электроинструмент', 'Power tools', 'Էլեկտրական գործիքներ', 'ელექტრო ხელსაწყოები'),
        items: [
          { id: 'drills', name: text('Дрели и шуруповерты', 'Drills & drivers', 'Փորվածքներ', 'ბურღები'), icon: '🪛' },
          { id: 'saws', name: text('Пилы и лобзики', 'Saws', 'Սղոցներ', 'ხერხები'), icon: '🪚' },
          { id: 'sanders', name: text('Шлифмашины', 'Sanders', 'Հղկողներ', 'საფხეკები'), icon: '🧰' },
          { id: 'compressors', name: text('Компрессоры и оборудование', 'Compressors', 'Խտացուցիչներ', 'კომპრესორები'), icon: '🌀' },
        ],
      },
      {
        id: 'hand-tools',
        title: text('Ручной инструмент', 'Hand tools', 'Ձեռքի գործիքներ', 'ხელის ხელსაწყოები'),
        items: [
          { id: 'wrenches', name: text('Ключи и головки', 'Wrenches & sockets', 'Բանալիներ', 'გასაღებები'), icon: '🔧' },
          { id: 'pliers', name: text('Плоскогубцы и кусачки', 'Pliers & cutters', 'Մանգաղներ', 'პლოსკოგუბცი'), icon: '🔩' },
          { id: 'hammers', name: text('Молоты и киянки', 'Hammers & mallets', 'Մուրճեր', 'ჩაქუჩები'), icon: '🔨' },
          { id: 'measure-tools', name: text('Измерительные приборы', 'Measuring tools', 'Չափման սարքեր', 'გაზომვის ხელსაწყოები'), icon: '📏' },
        ],
      },
      {
        id: 'home-improvement',
        title: text('Дом и безопасность', 'Home improvement', 'Տուն և անվտանգություն', 'სახლი და უსაფრთხოება'),
        items: [
          { id: 'lighting-fixtures', name: text('Освещение и смарт-реле', 'Lighting & smart switches', 'Լուսավորություն', 'განათება'), icon: '💡' },
          { id: 'electrical', name: text('Электрика и кабели', 'Electrical', 'Էլեկտրիկա', 'ელექტროობა'), icon: '🔌' },
          { id: 'safety-home', name: text('Детекторы и сигнализация', 'Detectors & alarms', 'Դետեկտորներ', 'სიგნალიზაცია'), icon: '🚨' },
          { id: 'storage-systems', name: text('Стеллажи и хранение', 'Storage systems', 'Պահեստավորման համակարգեր', 'შენახვის სისტემები'), icon: '🗄️' },
        ],
      },
    ],
  },
  {
    id: 'luggage-travel',
    name: text('Путешествия и багаж', 'Luggage & travel', 'Ճամփորդություն և ուղեբեռ', 'მოგზაურობა და ბარგი'),
    icon: '🧳',
    sections: [
      {
        id: 'travel-bags',
        title: text('Чемоданы и сумки', 'Travel bags', 'Ճամփորդական պայուսակներ', 'სამოგზაურო ჩანთები'),
        items: [
          { id: 'suitcases', name: text('Чемоданы', 'Suitcases', 'Ուղեբեռի ճամպրուկներ', 'ჩემოდნები'), icon: '🧳' },
          { id: 'carry-on', name: text('Ручная кладь', 'Carry-on', 'Ձեռքի ուղեբեռ', 'ხელბარგი'), icon: '🛄' },
          { id: 'duffle', name: text('Баулы и сумки', 'Duffle bags', 'Ձեռնարկային պայուսակներ', 'დაფლის ჩანთები'), icon: '👜' },
          { id: 'travel-backpacks', name: text('Рюкзаки и походные сумки', 'Travel backpacks', 'Ճամփորդական ուսապարկեր', 'სამოგზაურო ზურგჩანთები'), icon: '🎒' },
        ],
      },
      {
        id: 'travel-accessories',
        title: text('Аксессуары и комфорт', 'Travel accessories', 'Աքսեսուարներ', 'აქსესუარები'),
        items: [
          { id: 'organizers', name: text('Органайзеры и косметички', 'Packing organizers', 'Կազմակարգիչներ', 'ორგანაიზერები'), icon: '🗂️' },
          { id: 'locks-tags', name: text('Замки и бирки', 'Locks & tags', 'Կողպեքներ և պիտակներ', 'საკეტები და ჭდეები'), icon: '🔐' },
          { id: 'pillows', name: text('Подушки и маски', 'Travel pillows & masks', 'Բարձիկներ', 'ბალიშები და ნიღბები'), icon: '💤' },
          { id: 'adapters', name: text('Адаптеры и зарядки', 'Adapters & chargers', 'Ադապտերներ', 'ადაპტერები'), icon: '🔌' },
        ],
      },
      {
        id: 'outdoor-travel',
        title: text('Активные поездки', 'Outdoor trips', 'Ակտիվ ուղևորություններ', 'გარე მოგზაურობა'),
        items: [
          { id: 'luggage-protection', name: text('Чехлы и защита', 'Covers & protection', 'Պաշտպանիչ պատյաններ', 'დაცვითი ქეისები'), icon: '🛡️' },
          { id: 'hydration', name: text('Фляги и гидраторы', 'Hydration', 'Ջրցաններ', 'ჰიდრატაცია'), icon: '🚰' },
          { id: 'camp-travel', name: text('Кемпинг и кемперы', 'Camping travel', 'Քեմփինգի պարագաներ', 'კემპინგის ინვენტარი'), icon: '🏕️' },
          { id: 'kids-travel', name: text('Детский багаж', 'Kids travel gear', 'Մանկական ուղեբեռ', 'ბავშვების ბარგი'), icon: '🧒' },
        ],
      },
    ],
  },
  {
    id: 'gaming-digital',
    name: text('Игры и цифровой контент', 'Gaming & digital', 'Խաղեր և թվային բովանդակություն', 'თამაშები და ციფრული კონტენტი'),
    icon: '🎮',
    sections: [
      {
        id: 'video-games',
        title: text('Видеоигры', 'Video games', 'Վիդեոխաղեր', 'ვიდეო თამაშები'),
        items: [
          { id: 'new-releases', name: text('Новые релизы', 'New releases', 'Նոր թողարկումներ', 'ახალი თამაშები'), icon: '✨' },
          { id: 'popular-series', name: text('Популярные жанры', 'Popular genres', 'Հանրաճանաչ ժանրեր', 'პოპულარული ჟანრები'), icon: '🕹️' },
          { id: 'indie-games', name: text('Инди', 'Indie', 'Ինդի', 'ინდური'), icon: '🧩' },
          { id: 'kids-games', name: text('Игры для детей', 'Kids games', 'Մանկական խաղեր', 'ბავშვური თამაშები'), icon: '🧒' },
        ],
      },
      {
        id: 'gaming-hardware',
        title: text('Приставки и аксессуары', 'Consoles & accessories', 'Խաղային սարքեր', 'სათამაშო მოწყობილობები'),
        items: [
          { id: 'consoles', name: text('Консоли и портативы', 'Consoles & handhelds', 'Կոնսոլներ', 'კონსოლები'), icon: '🎮' },
          { id: 'controllers', name: text('Контроллеры и рули', 'Controllers & wheels', 'Կառավարման սարքեր', 'კონტროლერები'), icon: '🎛️' },
          { id: 'headsets', name: text('Гарнитуры и микрофоны', 'Headsets & mics', 'Ականջակալներ', 'ყურსასმენები'), icon: '🎧' },
          { id: 'storage', name: text('Накопители и карты', 'Storage & cards', 'Պահեստ և քարտեր', 'მეხსიერება'), icon: '💾' },
        ],
      },
      {
        id: 'digital-services',
        title: text('Цифровые подписки', 'Digital services', 'Թվային ծառայություններ', 'ციფრული სერვისები'),
        items: [
          { id: 'gift-codes', name: text('Подарочные коды', 'Gift codes', 'Նվեր կոդեր', 'სასაჩუქრე კოდები'), icon: '🎁' },
          { id: 'cloud-gaming', name: text('Облачный гейминг', 'Cloud gaming', 'Մառախուղային խաղեր', 'ქლაუდ გეიმინგი'), icon: '☁️' },
          { id: 'software-subscriptions', name: text('Пакеты и подписки', 'Software passes', 'Պրոգրամմային փաթեթներ', 'პროგრამული პასები'), icon: '🧾' },
          { id: 'dev-tools', name: text('Инструменты для разработчиков', 'Dev tools', 'Մշակող սարքեր', 'დეველოპერული ხელსაწყოები'), icon: '💻' },
        ],
      },
    ],
  },
  {
    id: 'music-instruments',
    name: text('Музыка и инструменты', 'Music & instruments', 'Երաժշտություն և գործիքներ', 'მუსიკა და ინსტრუმენტები'),
    icon: '🎸',
    sections: [
      {
        id: 'instruments',
        title: text('Инструменты', 'Instruments', 'Գործիքներ', 'ინსტრუმენტები'),
        items: [
          { id: 'guitars', name: text('Гитары и басы', 'Guitars & basses', 'Կիթառներ և բասեր', 'გიტარები'), icon: '🎸' },
          { id: 'keyboards', name: text('Клавишные', 'Keyboards', 'Սինթեզատորներ', 'კლავიატურები'), icon: '🎹' },
          { id: 'drums', name: text('Ударные и перкуссия', 'Drums & percussion', 'Թմբուկներ', 'დრამები'), icon: '🥁' },
          { id: 'orchestra', name: text('Оркестровые', 'Orchestral', 'Սիմֆոնիկ', 'ორკესტრული'), icon: '🎻' },
        ],
      },
      {
        id: 'studio-production',
        title: text('Студия и звук', 'Studio & sound', 'Ստուդիա և ձայն', 'სტუდია და ხმა'),
        items: [
          { id: 'audio-interfaces', name: text('Аудиоинтерфейсы', 'Audio interfaces', 'Ձայնային ինտերֆեյսներ', 'აუდიო ინტერფეისები'), icon: '🎛️' },
          { id: 'microphones', name: text('Микрофоны', 'Microphones', 'Միկրոֆոններ', 'მიკროფონები'), icon: '🎙️' },
          { id: 'monitors', name: text('Мониторы и наушники', 'Monitors & headphones', 'Մոնիտորներ և ականջակալներ', 'მონიტორები და ყურსასმენები'), icon: '🎧' },
          { id: 'software-music', name: text('ПО и плагины', 'Software & plugins', 'Ծրագրեր և պլագիններ', 'პროგრამული და პლაგინები'), icon: '💻' },
        ],
      },
      {
        id: 'music-accessories',
        title: text('Аксессуары и сервис', 'Accessories & care', 'Աքսեսուարներ և խնամք', 'აქსესუარები და მოვლა'),
        items: [
          { id: 'cases', name: text('Чехлы и стойки', 'Cases & stands', 'Պատյաններ', 'ქეისები და სტენდები'), icon: '🧳' },
          { id: 'strings', name: text('Струны и палочки', 'Strings & sticks', 'Լարեր և փայտիկներ', 'სიმები და ჯოხები'), icon: '🪕' },
          { id: 'maintenance', name: text('Уход и ремонт', 'Maintenance', 'Խնամք և վերանորոգում', 'მოვლა და რემონტი'), icon: '🧴' },
          { id: 'sheet-music', name: text('Ноты и учебники', 'Sheet music & lessons', 'Նոտաներ և դասագրքեր', 'ნოტები და გაკვეთილები'), icon: '📘' },
        ],
      },
    ],
  },
  {
    id: 'services-giftcards',
    name: text('Сервисы и подарки', 'Services & gift cards', 'Ծառայություններ և նվեր քարտեր', 'სერვისები და საჩუქრები'),
    icon: '🎁',
    sections: [
      {
        id: 'gift-cards-hub',
        title: text('Подарочные сертификаты', 'Gift cards', 'Նվեր քարտեր', 'სასაჩუქრე ბარათები'),
        items: [
          { id: 'digital-gift', name: text('Цифровые карты', 'Digital cards', 'Թվային քարտեր', 'ციფრული ბარათები'), icon: '💳' },
          { id: 'physical-gift', name: text('Физические карты', 'Physical cards', 'Ֆիզիկական քարտեր', 'ფიზიკური ბარათები'), icon: '📦' },
          { id: 'event-gift', name: text('Впечатления и мероприятия', 'Experiences', 'Փորձառություններ', 'ემოციების საჩუქრები'), icon: '🎟️' },
          { id: 'corporate-gift', name: text('Корпоративные наборы', 'Corporate gifts', 'Կորպորատիվ նվերներ', 'კორპორატიული საჩუქრები'), icon: '🏢' },
        ],
      },
      {
        id: 'subscriptions',
        title: text('Подписки и коробки', 'Subscriptions & boxes', 'Բաժանորդագրություններ', 'გამოწერები'),
        items: [
          { id: 'meal-kits', name: text('Наборы еды', 'Meal kits', 'Սննդի հավաքածուներ', 'კვების ნაკრებები'), icon: '🥗' },
          { id: 'beauty-boxes', name: text('Бьюти-боксы', 'Beauty boxes', 'Գեղեցկության արկղիկներ', 'ბიუთი ბოქსები'), icon: '💄' },
          { id: 'book-clubs', name: text('Книжные клубы', 'Book clubs', 'Գրքային ակումբներ', 'წიგნების კლუბები'), icon: '📚' },
          { id: 'pet-boxes', name: text('Для питомцев', 'Pet boxes', 'Կենդանիների արկղիկներ', 'ცხოველების ბოქსები'), icon: '🐕' },
        ],
      },
      {
        id: 'professional-services',
        title: text('Профессиональные услуги', 'Professional services', 'Մասնագիտական ծառայություններ', 'პროფესიული სერვისები'),
        items: [
          { id: 'home-services', name: text('Домашние мастера', 'Home services', 'Տան վարպետներ', 'სერვისი სახლში'), icon: '🛠️' },
          { id: 'tech-support', name: text('Техподдержка и настройка', 'Tech support', 'Տեխնիկական աջակցություն', 'ტექ-დახმარება'), icon: '🖥️' },
          { id: 'consulting', name: text('Консалтинг и обучение', 'Consulting & tutoring', 'Խորհրդատվություն', 'კონსულტაცია'), icon: '🧠' },
          { id: 'events-services', name: text('Организация событий', 'Event services', 'Միջոցառումների կազմակերպում', 'ივენთ სერვისები'), icon: '🎉' },
        ],
      },
    ],
  },
  {
    id: 'health-household',
    name: text('Здоровье и дом', 'Health & household', 'Առողջություն և տուն', 'ჯანმრთელობა და სახლი'),
    icon: '🩺',
    sections: [
      {
        id: 'wellness-health',
        title: text('Аптека и витамины', 'Pharmacy & vitamins', 'Դեղատուն և վիտամիններ', 'აფთიაქი და ვიტამინები'),
        items: [
          { id: 'supplements', name: text('Добавки и витамины', 'Supplements', 'Հավելումներ', 'დამატებები'), icon: '💊' },
          { id: 'first-aid', name: text('Первая помощь', 'First aid', 'Առաջին օգնություն', 'პირველი დახმარება'), icon: '⛑️' },
          { id: 'personal-care-health', name: text('Гигиена и уход', 'Personal care', 'Հիգիենա', 'ჰიგიენა'), icon: '🧼' },
          { id: 'health-devices', name: text('Измерительные приборы', 'Health devices', 'Առողջապահական սարքեր', 'ჯანმრთელობის მოწყობილობები'), icon: '📟' },
        ],
      },
      {
        id: 'household-essentials',
        title: text('Домашние расходники', 'Household essentials', 'Տան անհրաժեշտություններ', 'საყოფაცხოვრებო საჭიროებები'),
        items: [
          { id: 'cleaning-supplies', name: text('Чистящие средства', 'Cleaning supplies', 'Մաքրող միջոցներ', 'საწმენდი საშუალებები'), icon: '🧽' },
          { id: 'laundry', name: text('Стирка и уход', 'Laundry care', 'Լվացք և խնամք', 'სარეცხი მოვლა'), icon: '🧺' },
          { id: 'paper-goods', name: text('Бумажная продукция', 'Paper goods', 'Թուղթ և անձեռոցիկներ', 'ქაღალდის პროდუქტები'), icon: '📄' },
          { id: 'air-care', name: text('Ароматы и свежесть', 'Air care', 'Օդի թարմացուցիչներ', 'ჰაერის სურნელები'), icon: '🌬️' },
        ],
      },
      {
        id: 'baby-care',
        title: text('Уход за малышами', 'Baby care essentials', 'Մանկական խնամք', 'ბავშვის მოვლა'),
        items: [
          { id: 'diapers', name: text('Подгузники', 'Diapers', 'Նապկիներ', 'საფენები'), icon: '🍼' },
          { id: 'wipes', name: text('Салфетки и кремы', 'Wipes & creams', 'Սրբիչներ և կրեմներ', 'სალფетки და კრემები'), icon: '🧴' },
          { id: 'feeding', name: text('Питание и аксессуары', 'Feeding', 'Սնունդ և աքսեսուարներ', 'კვება და აქსესუარები'), icon: '🍲' },
          { id: 'safety-baby', name: text('Безопасность дома', 'Baby safety', 'Անվտանգություն տանը', 'უსაფრთხოება სახლში'), icon: '🛡️' },
        ],
      },
    ],
  },
  {
    id: 'art-collectibles',
    name: text('Творчество и коллекции', 'Art & collectibles', 'Ստեղծագործություն և հավաքածուներ', 'ხელოვნება და კოლექციები'),
    icon: '🖼️',
    sections: [
      {
        id: 'arts-crafts',
        title: text('Хобби и творчество', 'Arts & crafts', 'Ստեղծագործական հոբբի', 'ხელოვნება და ხელსაქმე'),
        items: [
          { id: 'painting', name: text('Живопись и рисование', 'Painting & drawing', 'Նկարազարդում', 'სახატავი მასალა'), icon: '🎨' },
          { id: 'crafting', name: text('Рукоделие и DIY', 'Crafting & DIY', 'Ձեռագործություն', 'ხელნაკეთი პროექტები'), icon: '✂️' },
          { id: 'sewing', name: text('Шитье и ткани', 'Sewing & fabrics', 'Կարվում', 'კერვა და ქსოვილები'), icon: '🧵' },
          { id: '3d-print', name: text('3D и моделизм', '3D & modeling', '3D տպագրություն', '3D ბეჭდვა'), icon: '🧱' },
        ],
      },
      {
        id: 'collectibles',
        title: text('Коллекционные предметы', 'Collectibles', 'Հավաքածուներ', 'კოლექციები'),
        items: [
          { id: 'coins', name: text('Монеты и банкноты', 'Coins & notes', 'Մետաղադրամներ', 'მონეტები'), icon: '🪙' },
          { id: 'figures', name: text('Фигурки и статуэтки', 'Figures & statues', 'Քանդակներ', 'ფიგურები'), icon: '🧸' },
          { id: 'trading-cards', name: text('Карточки и игры', 'Trading cards', 'Քարտեր', 'სავაჭრო ბარათები'), icon: '🃏' },
          { id: 'memorabilia', name: text('Меморабилия и редкости', 'Memorabilia', 'Հուշանվերներ', 'სასიამოვნო ნივთები'), icon: '🏆' },
        ],
      },
      {
        id: 'fine-art',
        title: text('Живопись и галерея', 'Fine art', 'Գեղարվեստական արվեստ', 'საეკლესიო ხელოვნება'),
        items: [
          { id: 'original-art', name: text('Оригинальные работы', 'Original works', 'Սկզբնական գործեր', 'ორიგინალი ხელოვნება'), icon: '🖌️' },
          { id: 'prints', name: text('Арт-принты', 'Art prints', 'Արվեստի տպագրություններ', 'არტ-პრინტები'), icon: '🖨️' },
          { id: 'photography', name: text('Фотография и постеры', 'Photography', 'Լուսանկարչություն', 'ფოტოგრაფია'), icon: '📷' },
          { id: 'sculptures', name: text('Скульптуры и объекты', 'Sculptures', 'Քանդակներ', 'ქანდაკებები'), icon: '🗿' },
        ],
      },
    ],
  },
  {
    id: 'smart-home-services',
    name: text('Умный дом и услуги', 'Smart home & services', 'Խելացի տուն և ծառայություններ', 'ჭკვიანი სახლი და სერვისები'),
    icon: '🏠',
    sections: [
      {
        id: 'smart-home-devices',
        title: text('Устройства умного дома', 'Smart home devices', 'Խելացի տան սարքեր', 'ჭკვიანი სახლის მოწყობილობები'),
        items: [
          { id: 'smart-hubs', name: text('Хабы и голосовые помощники', 'Hubs & assistants', 'Հաբեր և օգնականներ', 'ჰაბები და ასისტენტები'), icon: '🗣️' },
          { id: 'smart-lighting', name: text('Освещение и датчики', 'Smart lighting & sensors', 'Լուսավորություն և տվիչներ', 'განათება და სენსორები'), icon: '💡' },
          { id: 'smart-security', name: text('Камеры и безопасность', 'Cameras & security', 'Անվտանգություն', 'უსაფრთხოება'), icon: '📹' },
          { id: 'smart-climate', name: text('Термостаты и климат', 'Climate control', 'Կլիմա', 'კლიმატის მართვა'), icon: '🌡️' },
        ],
      },
      {
        id: 'home-network',
        title: text('Сети и мультимедиа', 'Networking & entertainment', 'Ցանց և մեդիա', 'ქსელი და მედია'),
        items: [
          { id: 'routers', name: text('Роутеры и mesh', 'Routers & mesh', 'Ռոուտերներ', 'როუტერები'), icon: '📡' },
          { id: 'streaming-devices', name: text('ТВ-приставки', 'Streaming devices', 'Սթրիմինգ սարքեր', 'სტრიმინგ მოწყობილობები'), icon: '📺' },
          { id: 'whole-home-audio', name: text('Много-комнатное аудио', 'Whole-home audio', 'Տան աուդիո', 'საოჯახო აუდიო'), icon: '🔊' },
          { id: 'automation-kits', name: text('Наборы автоматизации', 'Automation kits', 'Ավտոմատ փաթեթներ', 'ავტომატიზაცია'), icon: '🧠' },
        ],
      },
      {
        id: 'installation-services',
        title: text('Монтаж и поддержка', 'Installation & support', 'Տեղադրում և սպասարկում', 'მონტაჟი და მხარდაჭერა'),
        items: [
          { id: 'setup-service', name: text('Профессиональная настройка', 'Pro setup', 'Մասնագիտական կարգավորում', 'პროფ. დაყენება'), icon: '👷' },
          { id: 'maintenance-service', name: text('Обслуживание и гарантия', 'Maintenance plans', 'Սպասարկման փաթեթներ', 'მოვლა'), icon: '🧾' },
          { id: 'energy-audit', name: text('Энергоаудит и оптимизация', 'Energy audit', 'Էներգեարտադրություն', 'ენერგო აუდიტი'), icon: '⚡' },
          { id: 'custom-integrations', name: text('Индивидуальные интеграции', 'Custom integrations', 'Անհատական ինտեգրացիաներ', 'ინდ. ინტეგრაციები'), icon: '🔗' },
        ],
      },
    ],
  },
  {
    id: 'gift-finder',
    name: text('Идеи для подарков', 'Gift ideas finder', 'Նվերների գաղափարներ', 'საჩუქრების იდეები'),
    icon: '🎀',
    sections: [
      {
        id: 'by-recipient',
        title: text('По получателю', 'By recipient', 'Ըստ ստացողի', 'მიმღების მიხედვით'),
        items: [
          { id: 'gifts-for-her', name: text('Для неё', 'For her', 'Նրա համար (կին)', 'მისთვის'), icon: '👩' },
          { id: 'gifts-for-him', name: text('Для него', 'For him', 'Նրա համար (տղամարդ)', 'მისთვის (კაცისთვის)'), icon: '👨' },
          { id: 'gifts-for-kids', name: text('Для детей', 'For kids', 'Մանկական նվերներ', 'ბავშვებისთვის'), icon: '🧒' },
          { id: 'gifts-for-teams', name: text('Коллегам и командам', 'Teams & coworkers', 'Աշխատակիցներին', 'კოლეგებისთვის'), icon: '👥' },
        ],
      },
      {
        id: 'by-budget',
        title: text('По бюджету', 'By budget', 'Ըստ բյուջեի', 'ბიუჯეტის მიხედვით'),
        items: [
          { id: 'gift-under25', name: text('До $25', 'Under $25', 'Մինչև $25', '25 დოლარამდე'), icon: '💵' },
          { id: 'gift-under50', name: text('$25–$50', '$25–$50', '$25–$50', '$25–$50'), icon: '💰' },
          { id: 'gift-under100', name: text('$50–$100', '$50–$100', '$50–$100', '$50–$100'), icon: '💳' },
          { id: 'gift-luxury', name: text('Премиум', 'Premium gifts', 'Պրեմիում նվերներ', 'პრემიუმ საჩუქრები'), icon: '💎' },
        ],
      },
      {
        id: 'by-occasion',
        title: text('Поводы и праздники', 'Occasions & holidays', 'Առիթներ', 'შესაბამისი საჭმელები'),
        items: [
          { id: 'birthday', name: text('День рождения', 'Birthdays', 'Ծննդյան օրեր', 'დაბადების დღე'), icon: '🎂' },
          { id: 'anniversary', name: text('Годовщины', 'Anniversaries', 'Տարեդարձեր', 'იუბილეები'), icon: '💞' },
          { id: 'housewarming', name: text('Новоселье', 'Housewarming', 'Տան վերաբացում', 'გასახლება'), icon: '🏡' },
          { id: 'seasonal-gifts', name: text('Сезонные праздники', 'Seasonal holidays', 'Սեզոնային տոներ', 'სეზონური დღესასწაულები'), icon: '❄️' },
        ],
      },
    ],
  },
  {
    id: 'financial-services',
    name: text('Финансы и страхование', 'Financial services', 'Ֆինանսներ և ապահովագրություն', 'ფინანსები და დაზღვევა'),
    icon: '💼',
    sections: [
      {
        id: 'payments',
        title: text('Платежи и переводы', 'Payments & transfers', 'Վճարումներ և փոխանցումներ', 'გადასახადები და გადარიცხვები'),
        items: [
          { id: 'wallets', name: text('Электронные кошельки', 'Digital wallets', 'Թվային դրամապանակներ', 'ციფრული საფულეები'), icon: '👛' },
          { id: 'peer-payments', name: text('P2P переводы', 'Peer payments', 'P2P փոխանցումներ', 'P2P გადარიცხვები'), icon: '🔄' },
          { id: 'bill-pay', name: text('Оплата счетов', 'Bill pay', 'Հաշիվների վճարում', 'ანგარიშების გადახდა'), icon: '📄' },
          { id: 'currency-exchange', name: text('Обмен валюты', 'Currency exchange', 'Արժույթի փոխանակում', 'ვალუტის გაცვლა'), icon: '💱' },
        ],
      },
      {
        id: 'credit-loans',
        title: text('Кредиты и страхование', 'Credit & insurance', 'Վարկեր և ապահովագրություն', 'სესხები და დაზღვევა'),
        items: [
          { id: 'personal-loans', name: text('Потребительские кредиты', 'Personal loans', 'Սպառողական վարկեր', 'საფინანსო სესხები'), icon: '📝' },
          { id: 'auto-loans', name: text('Автокредиты и лизинг', 'Auto loans & leasing', 'Ավտովարկեր', 'ავტო ლიზინგი'), icon: '🚗' },
          { id: 'home-insurance', name: text('Страхование имущества', 'Home insurance', 'Գույքի ապահովագրություն', 'ქონების დაზღვევა'), icon: '🏡' },
          { id: 'health-insurance', name: text('Медицинские планы', 'Health insurance', 'Առողջության ապահովագրություն', 'სამედიცინო დაზღვევა'), icon: '🩺' },
        ],
      },
      {
        id: 'wealth-management',
        title: text('Инвестиции и защита', 'Investments & protection', 'Ներդրումներ և պաշտպանություն', 'ინვესტიციები'),
        items: [
          { id: 'brokerage', name: text('Брокерские счета', 'Brokerage accounts', 'Բրոքերային հաշիվներ', 'ბროკერული ანგარიშები'), icon: '📊' },
          { id: 'retirement', name: text('Пенсионные программы', 'Retirement plans', 'Թոշակային ծրագրեր', 'პენსიის გეგმები'), icon: '🪙' },
          { id: 'crypto', name: text('Крипто и токены', 'Crypto & tokens', 'Քրիպտո', 'კრიპტო'), icon: '🪙' },
          { id: 'identity-protect', name: text('Защита личности', 'Identity protection', 'Անձնական պաշտպանություն', 'იდენტობის დაცვა'), icon: '🛡️' },
        ],
      },
    ],
  },
  {
    id: 'education-learning',
    name: text('Обучение и курсы', 'Education & learning', 'Կրթություն և ուսուցում', 'განათლება და სწავლა'),
    icon: '🎓',
    sections: [
      {
        id: 'online-courses',
        title: text('Онлайн-курсы', 'Online courses', 'Առցանց դասընթացներ', 'ონლაინ კურსები'),
        items: [
          { id: 'tech-courses', name: text('IT и программирование', 'Tech & coding', 'Տեխնոլոգիաներ', 'ტექ და კოდინგი'), icon: '💻' },
          { id: 'design-courses', name: text('Дизайн и творчество', 'Design & creative', 'Դիզայն', 'დიზაინი'), icon: '🎨' },
          { id: 'business-courses', name: text('Бизнес и менеджмент', 'Business & management', 'Բիզնես', 'ბიზნესი და მენეჯმენტი'), icon: '📈' },
          { id: 'wellness-courses', name: text('Личностный рост и здоровье', 'Wellness & growth', 'Անձնական զարգացում', 'პიროვნული განვითარება'), icon: '🧘' },
        ],
      },
      {
        id: 'languages',
        title: text('Языки', 'Languages', 'Լեզուներ', 'ენები'),
        items: [
          { id: 'english', name: text('Английский', 'English', 'Անգլերեն', 'ინგლისური'), icon: '🇬🇧' },
          { id: 'spanish', name: text('Испанский', 'Spanish', 'Իսպաներեն', 'ესპანური'), icon: '🇪🇸' },
          { id: 'asian-languages', name: text('Азия и Восток', 'Asian & eastern', 'Ասիական', 'აზიური ენები'), icon: '🌏' },
          { id: 'regional-languages', name: text('Региональные программы', 'Regional programs', 'Տարածաշրջանային ծրագրեր', 'რეგიონული პროგრამები'), icon: '🗺️' },
        ],
      },
      {
        id: 'kids-learning',
        title: text('Детям и студентам', 'Kids & students', 'Մանկական և ուսանողական', 'ბავშვებს და სტუდენტებს'),
        items: [
          { id: 'stem-kits', name: text('STEM наборы и кодинг', 'STEM & coding', 'STEM հավաքածուներ', 'STEM და კოდინგი'), icon: '🧪' },
          { id: 'tutoring', name: text('Репетиторы и подготовка', 'Tutoring & prep', 'Դասավանդում', 'რეპეტიტორობა'), icon: '📚' },
          { id: 'exam-prep', name: text('Экзамены и тесты', 'Exam prep', 'Քննություններ', 'გამოცდის მზადება'), icon: '📝' },
          { id: 'arts-music-lessons', name: text('Музыка и искусство', 'Music & arts lessons', 'Երաժշտական դասեր', 'მუსიკა და ხელოვნება'), icon: '🎻' },
        ],
      },
    ],
  },
]

const defaultCategoryId = categories[0]?.id ?? null

export function MegaMenu() {
  const { language } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(defaultCategoryId)

  const activeCategoryData = useMemo(
    () => categories.find((category) => category.id === activeCategory),
    [activeCategory],
  )

  const t = (ru: string, en: string, hy: string, ka: string) => {
    switch (language) {
      case 'ru':
        return ru
      case 'en':
        return en
      case 'hy':
        return hy
      case 'ka':
        return ka
      default:
        return en
    }
  }

  const getText = (value: Localized) => value[language] ?? value.en

  const toggleMenu = () => {
    setIsOpen((prev) => !prev)
  }

  const handleClose = () => {
    setIsOpen(false)
    setActiveCategory(defaultCategoryId)
  }

  return (
    <nav className={styles.megaMenu}>
      <button
        className={styles.menuToggle}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-label={t('Меню категорий', 'Categories menu', 'Կատեգորիաների ցանկ', 'კატეგორიების მენიუ')}
      >
        <span>☰</span>
        <span>{t('Категории', 'Categories', 'Կատեգորիաներ', 'კატეგორიები')}</span>
      </button>

      {isOpen && (
        <div className={styles.menuContainer} onMouseLeave={handleClose}>
          <div className={styles.categoriesList}>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`${styles.categoryItem} ${
                  activeCategory === category.id ? styles.categoryItemActive : ''
                }`}
                onMouseEnter={() => setActiveCategory(category.id)}
                onFocus={() => setActiveCategory(category.id)}
              >
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  <span className={styles.categoryName}>{getText(category.name)}</span>
                  <span className={styles.arrow}>›</span>
                </div>
              </button>
            ))}
          </div>

          {activeCategoryData && (
            <div className={styles.subcategoriesPanel}>
              {activeCategoryData.sections.map((section) => (
                <div key={section.id} className={styles.sectionGroup}>
                  <h4 className={styles.sectionTitle}>{getText(section.title)}</h4>
                  <div className={styles.sectionItems}>
                    {section.items.map((item) => (
                      <a
                        key={item.id}
                        href={`/category/${item.id}`}
                        className={styles.subcategoryItem}
                        onClick={handleClose}
                      >
                        <span className={styles.subcategoryIcon}>{item.icon}</span>
                        <span className={styles.subcategoryName}>{getText(item.name)}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

