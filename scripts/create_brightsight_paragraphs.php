<?php

/**
 * @file
 * Creates paragraph types + fields for the Brightsight SDC design system.
 *
 * Run with: ddev drush scr scripts/create_brightsight_paragraphs.php
 * Idempotent — existing types/fields are left untouched.
 */

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\paragraphs\Entity\ParagraphsType;

// ---------------------------------------------------------------------------
// Field storage definitions (shared across paragraph bundles).
// ---------------------------------------------------------------------------
$storages = [
  'field_eyebrow' => ['type' => 'string'],
  'field_heading' => ['type' => 'string'],
  'field_heading_accent' => ['type' => 'string'],
  'field_heading_lines' => ['type' => 'string', 'cardinality' => -1],
  'field_accent_line' => ['type' => 'integer'],
  'field_accent' => ['type' => 'string'],
  'field_tagline' => ['type' => 'string'],
  'field_body_text' => ['type' => 'text_long'],
  'field_image' => ['type' => 'entity_reference', 'settings' => ['target_type' => 'media']],
  'field_buttons' => ['type' => 'entity_reference_revisions', 'cardinality' => 3, 'settings' => ['target_type' => 'paragraph']],
  'field_items' => ['type' => 'entity_reference_revisions', 'cardinality' => -1, 'settings' => ['target_type' => 'paragraph']],
  'field_team' => ['type' => 'entity_reference_revisions', 'cardinality' => -1, 'settings' => ['target_type' => 'paragraph']],
  'field_columns' => ['type' => 'entity_reference_revisions', 'cardinality' => -1, 'settings' => ['target_type' => 'paragraph']],
  'field_label' => ['type' => 'string'],
  'field_url' => ['type' => 'link'],
  'field_links' => ['type' => 'link', 'cardinality' => -1],
  'field_legal_links' => ['type' => 'link', 'cardinality' => -1],
  'field_variant' => ['type' => 'list_string', 'settings' => ['allowed_values' => ['primary' => 'Primary (solid)', 'outline' => 'Outline (ghost)']]],
  'field_arrow' => ['type' => 'boolean'],
  'field_tags' => ['type' => 'string', 'cardinality' => -1],
  'field_notes' => ['type' => 'string', 'cardinality' => -1],
  'field_badge' => ['type' => 'string'],
  'field_sku' => ['type' => 'string'],
  'field_category' => ['type' => 'string'],
  'field_subtitle' => ['type' => 'string'],
  'field_availability' => ['type' => 'list_string', 'settings' => ['allowed_values' => ['available' => 'Available', 'limited' => 'Limited stock', 'rented' => 'Out on tour']]],
  'field_stock' => ['type' => 'string'],
  'field_specs' => ['type' => 'string', 'cardinality' => -1],
  'field_price' => ['type' => 'string'],
  'field_price_period' => ['type' => 'string'],
  'field_meta' => ['type' => 'string'],
  'field_tag' => ['type' => 'string'],
  'field_value' => ['type' => 'integer'],
  'field_suffix' => ['type' => 'string'],
  'field_sliders' => ['type' => 'string', 'cardinality' => -1],
  'field_details' => ['type' => 'string', 'cardinality' => -1],
  'field_partners' => ['type' => 'string', 'cardinality' => -1],
  'field_project_types' => ['type' => 'string', 'cardinality' => -1],
  'field_initials' => ['type' => 'string'],
  'field_role' => ['type' => 'string'],
  'field_cert' => ['type' => 'string'],
  'field_copyright' => ['type' => 'string'],
];

foreach ($storages as $name => $def) {
  if (!FieldStorageConfig::loadByName('paragraph', $name)) {
    FieldStorageConfig::create([
      'field_name' => $name,
      'entity_type' => 'paragraph',
      'type' => $def['type'],
      'cardinality' => $def['cardinality'] ?? 1,
      'settings' => $def['settings'] ?? [],
    ])->save();
    print "storage: $name\n";
  }
}

// ---------------------------------------------------------------------------
// Paragraph bundles. Each entry: label, description, fields.
// Field entry: [label, required, description, handler target bundles (for ERR)].
// ---------------------------------------------------------------------------
$bundles = [
  'bs_button' => [
    'label' => 'BS Button',
    'description' => 'CTA button (solid or outline).',
    'fields' => [
      'field_label' => ['Label', TRUE, ''],
      'field_url' => ['Link', TRUE, ''],
      'field_variant' => ['Variant', FALSE, 'Defaults to Primary.'],
      'field_arrow' => ['Trailing arrow', FALSE, 'Append a → after the label.'],
    ],
  ],
  'bs_hero' => [
    'label' => 'BS Hero',
    'description' => 'Full-viewport hero with two-tone headline and CTAs.',
    'fields' => [
      'field_eyebrow' => ['Eyebrow', FALSE, 'Mono label above the headline.'],
      'field_heading' => ['Headline (light part)', TRUE, 'e.g. BRIGHT'],
      'field_heading_accent' => ['Headline (accent part)', FALSE, 'e.g. SIGHT'],
      'field_tagline' => ['Tagline', FALSE, ''],
      'field_body_text' => ['Intro text', FALSE, ''],
      'field_image' => ['Background image', FALSE, 'Optional, shown behind the content with a dark overlay.'],
      'field_buttons' => ['Buttons', FALSE, '', ['bs_button']],
    ],
  ],
  'bs_discipline' => [
    'label' => 'BS Discipline',
    'description' => 'One expandable row in the disciplines list. Numbers are automatic.',
    'fields' => [
      'field_heading' => ['Title', TRUE, ''],
      'field_tags' => ['Tags', FALSE, 'Short keywords, one per value.'],
      'field_body_text' => ['Description', FALSE, 'Shown when the row is expanded.'],
    ],
  ],
  'bs_disciplines_list' => [
    'label' => 'BS Disciplines List',
    'description' => '"What We Control" section with numbered expandable rows.',
    'fields' => [
      'field_eyebrow' => ['Eyebrow', FALSE, ''],
      'field_heading' => ['Heading (light part)', TRUE, ''],
      'field_heading_accent' => ['Heading (accent part)', FALSE, ''],
      'field_items' => ['Disciplines', TRUE, '', ['bs_discipline']],
    ],
  ],
  'bs_product' => [
    'label' => 'BS Product',
    'description' => 'Rental equipment card.',
    'fields' => [
      'field_image' => ['Photo', FALSE, ''],
      'field_badge' => ['Badge', FALSE, 'e.g. FLAGSHIP'],
      'field_sku' => ['SKU', FALSE, ''],
      'field_category' => ['Category', FALSE, 'e.g. LIGHTING CONSOLE'],
      'field_heading' => ['Name', TRUE, ''],
      'field_subtitle' => ['Subtitle', FALSE, ''],
      'field_availability' => ['Availability', FALSE, ''],
      'field_stock' => ['Stock label', FALSE, 'e.g. 3 UNITS'],
      'field_specs' => ['Specs', FALSE, 'One per value as LABEL|VALUE, e.g. PARAMETERS|12288'],
      'field_body_text' => ['Description', FALSE, ''],
      'field_price' => ['Rate amount', FALSE, 'e.g. €450'],
      'field_price_period' => ['Rate period', FALSE, 'Defaults to / DAY'],
      'field_url' => ['Quote link', FALSE, ''],
      'field_accent' => ['Accent color', FALSE, 'Hex, defaults to #ff9500'],
    ],
  ],
  'bs_product_grid' => [
    'label' => 'BS Product Grid',
    'description' => '"The Arsenal" section: grid of rental equipment cards.',
    'fields' => [
      'field_eyebrow' => ['Eyebrow', FALSE, ''],
      'field_heading' => ['Heading (light part)', TRUE, ''],
      'field_heading_accent' => ['Heading (accent part)', FALSE, ''],
      'field_accent' => ['Accent color', FALSE, 'Hex, defaults to #28c8f0'],
      'field_notes' => ['Assurance notes', FALSE, 'e.g. 5-YEAR WARRANTY'],
      'field_items' => ['Products', TRUE, '', ['bs_product']],
    ],
  ],
  'bs_project' => [
    'label' => 'BS Project',
    'description' => 'One project in the showcase.',
    'fields' => [
      'field_meta' => ['Meta line', FALSE, 'e.g. 2024 — Live Event'],
      'field_heading' => ['Title', TRUE, ''],
      'field_tag' => ['Tag', FALSE, 'e.g. Arena'],
      'field_accent' => ['Accent color', FALSE, 'Hex, defaults to #ff9500'],
      'field_image' => ['Image', FALSE, ''],
      'field_specs' => ['Stats', FALSE, 'One per value as LABEL|VALUE, e.g. CHANNELS|6144'],
    ],
  ],
  'bs_projects_showcase' => [
    'label' => 'BS Projects Showcase',
    'description' => '"Live Projects" section: featured panel with switching side nav.',
    'fields' => [
      'field_eyebrow' => ['Eyebrow', FALSE, ''],
      'field_heading' => ['Heading (light part)', TRUE, ''],
      'field_heading_accent' => ['Heading (accent part)', FALSE, ''],
      'field_items' => ['Projects', TRUE, '', ['bs_project']],
    ],
  ],
  'bs_stat' => [
    'label' => 'BS Stat',
    'description' => 'One animated counter.',
    'fields' => [
      'field_value' => ['Value', TRUE, 'The number to count up to.'],
      'field_suffix' => ['Suffix', FALSE, 'Defaults to +'],
      'field_label' => ['Label', TRUE, ''],
    ],
  ],
  'bs_team_member' => [
    'label' => 'BS Team Member',
    'description' => 'One team card in the about section.',
    'fields' => [
      'field_initials' => ['Initials', TRUE, ''],
      'field_heading' => ['Name', TRUE, ''],
      'field_role' => ['Role', FALSE, ''],
      'field_cert' => ['Certification', FALSE, 'e.g. grandMA3 Certified'],
      'field_accent' => ['Accent color', FALSE, 'Hex, defaults to #ff9500'],
    ],
  ],
  'bs_about_stats' => [
    'label' => 'BS About + Stats',
    'description' => '"Lights Are Language" about section with counters and team.',
    'fields' => [
      'field_eyebrow' => ['Eyebrow', FALSE, ''],
      'field_heading_lines' => ['Heading lines', TRUE, 'One line per value.'],
      'field_accent_line' => ['Accented line', FALSE, 'Zero-based index, defaults to the last line.'],
      'field_body_text' => ['Text', FALSE, ''],
      'field_sliders' => ['Console sliders', FALSE, 'One per value as LABEL|PERCENT|COLOR, e.g. MAIN DIMMER|92|#ff9500'],
      'field_items' => ['Counters', FALSE, '', ['bs_stat']],
      'field_team' => ['Team members', FALSE, '', ['bs_team_member']],
    ],
  ],
  'bs_contact_cta' => [
    'label' => 'BS Contact CTA',
    'description' => '"Let\'s Build Your Show" contact section with project-brief form.',
    'fields' => [
      'field_eyebrow' => ['Eyebrow', FALSE, 'Defaults to GET IN TOUCH'],
      'field_heading_lines' => ['Heading lines', TRUE, 'One line per value.'],
      'field_accent_line' => ['Accented line', FALSE, 'Zero-based index, defaults to 1.'],
      'field_body_text' => ['Text', FALSE, ''],
      'field_details' => ['Contact details', FALSE, 'One per value as LABEL|VALUE or LABEL|VALUE|URL'],
      'field_partners' => ['Partners', FALSE, 'One name per value.'],
      'field_project_types' => ['Project types', FALSE, 'Dropdown options for the form.'],
    ],
  ],
  'bs_footer_column' => [
    'label' => 'BS Footer Column',
    'description' => 'One link column in the footer.',
    'fields' => [
      'field_heading' => ['Column title', TRUE, ''],
      'field_links' => ['Links', TRUE, ''],
    ],
  ],
  'bs_site_footer' => [
    'label' => 'BS Site Footer',
    'description' => 'Footer with brand, link columns and legal bar.',
    'fields' => [
      'field_tagline' => ['Tagline', FALSE, ''],
      'field_columns' => ['Link columns', FALSE, '', ['bs_footer_column']],
      'field_copyright' => ['Copyright', FALSE, ''],
      'field_legal_links' => ['Legal links', FALSE, ''],
    ],
  ],
];

$display_repository = \Drupal::service('entity_display.repository');

foreach ($bundles as $id => $info) {
  if (!ParagraphsType::load($id)) {
    ParagraphsType::create([
      'id' => $id,
      'label' => $info['label'],
      'description' => $info['description'],
    ])->save();
    print "bundle: $id\n";
  }

  $form_display = $display_repository->getFormDisplay('paragraph', $id);
  $weight = 0;

  foreach ($info['fields'] as $field_name => $field_info) {
    [$label, $required, $description] = $field_info;
    if (!FieldConfig::loadByName('paragraph', $id, $field_name)) {
      $config = [
        'field_name' => $field_name,
        'entity_type' => 'paragraph',
        'bundle' => $id,
        'label' => $label,
        'required' => $required,
        'description' => $description,
      ];
      if (isset($field_info[3])) {
        $config['settings'] = [
          'handler' => 'default:paragraph',
          'handler_settings' => [
            'target_bundles' => array_combine($field_info[3], $field_info[3]),
            'negate' => 0,
          ],
        ];
      }
      $storage = FieldStorageConfig::loadByName('paragraph', $field_name);
      if ($storage->getType() === 'entity_reference' && $storage->getSetting('target_type') === 'media') {
        $config['settings'] = [
          'handler' => 'default:media',
          'handler_settings' => ['target_bundles' => ['image' => 'image'], 'negate' => 0],
        ];
      }
      FieldConfig::create($config)->save();
      print "  field: $id.$field_name\n";
    }

    $storage = FieldStorageConfig::loadByName('paragraph', $field_name);
    $widget = match ($storage->getType()) {
      'entity_reference_revisions' => 'paragraphs',
      'entity_reference' => 'media_library_widget',
      'text_long' => 'text_textarea',
      'link' => 'link_default',
      'list_string' => 'options_select',
      'boolean' => 'boolean_checkbox',
      'integer' => 'number',
      default => 'string_textfield',
    };
    $form_display->setComponent($field_name, ['type' => $widget, 'weight' => $weight++]);
  }
  $form_display->save();
}

// ---------------------------------------------------------------------------
// Allow the section bundles on node.page.field_paragraphs.
// ---------------------------------------------------------------------------
$sections = [
  'bs_hero', 'bs_disciplines_list', 'bs_product_grid', 'bs_projects_showcase',
  'bs_about_stats', 'bs_contact_cta', 'bs_site_footer',
];
$field = FieldConfig::loadByName('node', 'page', 'field_paragraphs');
if ($field) {
  $settings = $field->getSetting('handler_settings');
  foreach ($sections as $section) {
    $settings['target_bundles'][$section] = $section;
    $settings['target_bundles_drag_drop'][$section] = ['enabled' => TRUE, 'weight' => 10];
  }
  $field->setSetting('handler_settings', $settings);
  $field->save();
  print "node.page.field_paragraphs: section bundles enabled\n";
}

print "Done.\n";
