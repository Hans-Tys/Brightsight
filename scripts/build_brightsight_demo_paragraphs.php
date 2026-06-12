<?php

/**
 * @file
 * Rebuilds the Brightsight homepage (node with alias /brightsight-homepage)
 * with paragraph entities instead of the hardcoded page template.
 *
 * Run with: ddev drush scr scripts/build_brightsight_demo_paragraphs.php
 */

use Drupal\paragraphs\Entity\Paragraph;

function bs_p(string $type, array $fields): Paragraph {
  $p = Paragraph::create(['type' => $type] + $fields);
  $p->save();
  return $p;
}

// --- Hero -------------------------------------------------------------------
$hero = bs_p('bs_hero', [
  'field_eyebrow' => 'PROFESSIONAL LIGHTING CONTROL',
  'field_heading' => 'BRIGHT',
  'field_heading_accent' => 'SIGHT',
  'field_tagline' => 'LIGHTING AUTOMATION SYSTEMS',
  'field_body_text' => 'Grand-scale lighting control solutions for live events, theatrical productions, architectural installations, and broadcast studios. Where precision meets power.',
  'field_buttons' => [
    bs_p('bs_button', ['field_label' => 'EXPLORE SYSTEMS', 'field_url' => ['uri' => 'internal:#systems'], 'field_variant' => 'primary']),
    bs_p('bs_button', ['field_label' => 'GET A QUOTE', 'field_url' => ['uri' => 'internal:#contact'], 'field_variant' => 'outline']),
  ],
]);

// --- Disciplines ------------------------------------------------------------
$disciplines = [
  ['LIVE EVENT CONTROL', ['Concert', 'Festival', 'Tour'], 'Show control for arenas, stadiums and festival main stages. Time-coded cue stacks, redundant networks, and operators who have done it at scale.'],
  ['THEATRICAL AUTOMATION', ['Stage', 'Opera', 'Dance'], 'Precision moving-light and rigging automation for theatre. Repeatable to the millimeter, silent enough for a whispered scene.'],
  ['ARCHITECTURAL LIGHTING', ['Facade', 'Museum', 'Public'], 'Permanent installations with scheduled scenes, sensor-driven behavior and remote monitoring.'],
  ['BROADCAST & STUDIO', ['TV', 'Film', 'Streaming'], 'Flicker-free, color-accurate control for camera environments, synced to the production switcher.'],
  ['SYSTEM DESIGN', ['Consult', 'Spec', 'Build'], 'From signal flow diagrams to commissioning — full system design for venues and tours.'],
  ['TRAINING & SUPPORT', ['Onsite', 'Remote', '24/7'], 'Operator training, certification tracks, and around-the-clock show support.'],
];
$discipline_items = [];
foreach ($disciplines as [$title, $tags, $description]) {
  $discipline_items[] = bs_p('bs_discipline', [
    'field_heading' => $title,
    'field_tags' => $tags,
    'field_body_text' => $description,
  ]);
}
$disciplines_list = bs_p('bs_disciplines_list', [
  'field_eyebrow' => '06 DISCIPLINES',
  'field_heading' => 'WHAT WE',
  'field_heading_accent' => 'CONTROL',
  'field_items' => $discipline_items,
]);

// --- Product grid -----------------------------------------------------------
$products = [
  ['FLAGSHIP', 'BS-MA3-FS', 'LIGHTING CONSOLE', 'GRANDMA3 FULL-SIZE', 'available', '3 UNITS',
    ['PARAMETERS|12288', 'EXECUTORS|30+30', 'SCREENS|3x FHD + 2', 'PROTOCOL|Art-Net / sACN'],
    'The industry-standard console for arena shows and world tours. Flight-cased, show-ready, with backup unit available on request.',
    '€450', '#ff9500'],
  ['COMPACT', 'BS-MA3-LT', 'LIGHTING CONSOLE', 'GRANDMA3 LIGHT', 'rented', '',
    ['PARAMETERS|8192', 'EXECUTORS|15+15', 'SCREENS|2x FHD', 'WEIGHT|42 KG'],
    'Same MA3 engine in a touring-friendly footprint.',
    '€320', '#28c8f0'],
  ['NETWORK', 'BS-NODE-16', 'DMX NODE', 'NODE-16', 'available', '12 UNITS',
    ['PORTS|16', 'THROUGHPUT|8.2M ch/s', 'LATENCY|<1ms', 'POWER|PoE+'],
    'Rack-mount DMX distribution with full RDM support and redundant ethernet rings.',
    '€85', '#3ddc7a'],
  ['VISUAL', 'BS-VIS-PRO', 'MEDIA SERVER', 'VISION PRO', 'limited', '1 UNIT',
    ['OUTPUTS|8x 4K60', 'STORAGE|32 TB NVMe', 'CODEC|NotchLC', 'SYNC|Genlock'],
    'Real-time media playback and pixel-mapping for video-heavy productions.',
    '€280', '#b06af0'],
];
$product_items = [];
foreach ($products as [$badge, $sku, $category, $name, $availability, $stock, $specs, $description, $price, $accent]) {
  $product_items[] = bs_p('bs_product', [
    'field_badge' => $badge,
    'field_sku' => $sku,
    'field_category' => $category,
    'field_heading' => $name,
    'field_availability' => $availability,
    'field_stock' => $stock,
    'field_specs' => $specs,
    'field_body_text' => $description,
    'field_price' => $price,
    'field_url' => ['uri' => 'internal:#contact'],
    'field_accent' => $accent,
  ]);
}
$product_grid = bs_p('bs_product_grid', [
  'field_eyebrow' => 'OUR EQUIPMENT',
  'field_heading' => 'THE',
  'field_heading_accent' => 'ARSENAL',
  'field_accent' => '#28c8f0',
  'field_notes' => ['ALL SYSTEMS MA3 NATIVE', 'FIRMWARE UPDATES INCLUDED', '5-YEAR WARRANTY'],
  'field_items' => $product_items,
]);

// --- Projects showcase ------------------------------------------------------
$projects = [
  ['2024 — Live Event', 'ELATION WORLD TOUR', 'Arena', '#ff9500',
    ['CHANNELS|6.144', 'FIXTURES|1.400', 'SHOWS|87', 'COUNTRIES|23']],
  ['2024 — Theatrical', 'NATIONAL OPERA HOUSE', 'Stage', '#00c8ff',
    ['CHANNELS|2.048', 'AXES|36', 'SEASONS|3', 'CUES|640']],
  ['2023 — Architectural', 'HARBOR BRIDGE FACADE', 'Public', '#3ddc7a',
    ['NODES|412', 'KM CABLE|18', 'SCENES|24/7', 'SENSORS|64']],
  ['2023 — Broadcast', 'EUROVISION STUDIO B', 'TV', '#b06af0',
    ['CAMERAS|14', 'CUES|1.900', 'VIEWERS|160M', 'CREW|12']],
];
$project_items = [];
foreach ($projects as [$meta, $title, $tag, $accent, $stats]) {
  $project_items[] = bs_p('bs_project', [
    'field_meta' => $meta,
    'field_heading' => $title,
    'field_tag' => $tag,
    'field_accent' => $accent,
    'field_specs' => $stats,
  ]);
}
$projects_showcase = bs_p('bs_projects_showcase', [
  'field_eyebrow' => 'FIELD WORK',
  'field_heading' => 'LIVE',
  'field_heading_accent' => 'PROJECTS',
  'field_items' => $project_items,
]);

// --- About + stats ----------------------------------------------------------
$stats = [
  [850, '+', 'SHOWS DELIVERED'],
  [120, 'K+', 'FIXTURES CONTROLLED'],
  [4200, '+', 'UNIVERSES DEPLOYED'],
  [14, '+', 'YEARS OF EXPERTISE'],
];
$stat_items = [];
foreach ($stats as [$value, $suffix, $label]) {
  $stat_items[] = bs_p('bs_stat', [
    'field_value' => $value,
    'field_suffix' => $suffix,
    'field_label' => $label,
  ]);
}
$team = [
  ['AM', 'ALEX MORIN', 'Head of Systems', 'grandMA3 Certified', '#ff9500'],
  ['SJ', 'SARA JANSEN', 'Lead Programmer', 'MA3 + Hog Certified', '#00c8ff'],
  ['DK', 'DAVID KIM', 'Network Architect', 'sACN Specialist', '#bf5fff'],
  ['MK', 'MILA KRÄMER', 'Fixture Designer', 'ROBE Certified', '#39ff14'],
];
$team_items = [];
foreach ($team as [$initials, $name, $role, $cert, $accent]) {
  $team_items[] = bs_p('bs_team_member', [
    'field_initials' => $initials,
    'field_heading' => $name,
    'field_role' => $role,
    'field_cert' => $cert,
    'field_accent' => $accent,
  ]);
}
$about_stats = bs_p('bs_about_stats', [
  'field_eyebrow' => 'ABOUT BRIGHTSIGHT',
  'field_heading_lines' => ['LIGHTS ARE', 'LANGUAGE.', 'WE SPEAK IT.'],
  'field_accent_line' => 2,
  'field_body_text' => "Founded in 2011, Brightsight has been at the intersection of engineering and artistry, delivering lighting control for the world's most demanding productions.\nOur team of grandMA3 certified operators, network architects and automation specialists turns creative ambition into reliable, repeatable shows.",
  'field_sliders' => [
    'MAIN DIMMER|92|#ff9500',
    'RGB MIX|78|#ff3d9a',
    'MOVING HEADS|65|#00c8ff',
    'STROBE BANK|40|#ffffff',
    'HAZE OUTPUT|55|#bf5fff',
    'FOLLOWSPOT|83|#39ff14',
  ],
  'field_items' => $stat_items,
  'field_team' => $team_items,
]);

// --- Contact ----------------------------------------------------------------
$contact = bs_p('bs_contact_cta', [
  'field_eyebrow' => 'GET IN TOUCH',
  'field_heading_lines' => ["LET'S BUILD", 'YOUR SHOW.'],
  'field_accent_line' => 1,
  'field_body_text' => "Whether you're planning a world tour, a theatrical premiere, or a permanent installation — tell us what you're imagining and we'll spec the system.",
  'field_details' => [
    'HEADQUARTERS|14 Console Row, Berlin, DE 10117',
    'EMERGENCY LINE|+49 30 5555 0100|tel:+493055550100',
    'EMAIL|ops@brightsight.io|mailto:ops@brightsight.io',
    'DISPATCH|24 / 7 / 365',
  ],
  'field_partners' => ['grandMA3', 'AYRTON', 'ROBE', 'CHAUVET', 'ETC', 'MA Lighting'],
  'field_project_types' => ['Live Event', 'Theatrical', 'Architectural', 'Broadcast', 'Other'],
]);

// --- Footer -----------------------------------------------------------------
$footer_columns = [
  ['SYSTEMS', [
    ['CTRL-4K Console', 'internal:#systems'],
    ['NODE-16 DMX', 'internal:#systems'],
    ['WING-M Portable', 'internal:#systems'],
    ['VISION PRO Software', 'internal:#systems'],
    ['Accessories', 'internal:#systems'],
  ]],
  ['SERVICES', [
    ['Live Events', 'internal:#'],
    ['Theatrical', 'internal:#'],
    ['Architectural', 'internal:#'],
    ['Broadcast', 'internal:#'],
    ['Training', 'internal:#'],
  ]],
  ['COMPANY', [
    ['About Us', 'internal:#'],
    ['Projects', 'internal:#'],
    ['Careers', 'internal:#'],
    ['Press Kit', 'internal:#'],
    ['Partners', 'internal:#'],
  ]],
  ['SUPPORT', [
    ['Documentation', 'internal:#'],
    ['Firmware', 'internal:#'],
    ['Emergency Line', 'tel:+493055550100'],
    ['Remote Support', 'internal:#'],
    ['Warranty', 'internal:#'],
  ]],
];
$column_items = [];
foreach ($footer_columns as [$title, $links]) {
  $column_items[] = bs_p('bs_footer_column', [
    'field_heading' => $title,
    'field_links' => array_map(fn($l) => ['title' => $l[0], 'uri' => $l[1]], $links),
  ]);
}
$footer = bs_p('bs_site_footer', [
  'field_tagline' => "Professional lighting control systems for the world's most demanding productions.",
  'field_columns' => $column_items,
  'field_copyright' => '© 2026 BRIGHTSIGHT SYSTEMS GmbH — BERLIN / LONDON',
  'field_legal_links' => [
    ['title' => 'PRIVACY', 'uri' => 'internal:#'],
    ['title' => 'TERMS', 'uri' => 'internal:#'],
    ['title' => 'IMPRINT', 'uri' => 'internal:#'],
  ],
]);

// --- Attach everything to the demo node -------------------------------------
$path = \Drupal::service('path_alias.manager')->getPathByAlias('/brightsight-homepage');
$nid = (int) str_replace('/node/', '', $path);
$node = \Drupal\node\Entity\Node::load($nid);
if (!$node) {
  print "ERROR: demo node not found\n";
  return;
}
$node->set('field_paragraphs', [
  $hero, $disciplines_list, $product_grid, $projects_showcase,
  $about_stats, $contact, $footer,
]);
$node->save();
print "Demo node $nid rebuilt with " . count($node->field_paragraphs) . " section paragraphs.\n";
