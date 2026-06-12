<?php

/**
 * @file
 * Adds the events-carousel paragraph types (bs_events_carousel + bs_event).
 *
 * Run with: ddev drush scr scripts/create_events_carousel_paragraph.php
 * Idempotent — existing types/fields are left untouched.
 */

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\paragraphs\Entity\ParagraphsType;

$storages = [
  'field_attendees' => ['type' => 'string'],
  'field_is_hot' => ['type' => 'boolean'],
];
foreach ($storages as $name => $def) {
  if (!FieldStorageConfig::loadByName('paragraph', $name)) {
    FieldStorageConfig::create([
      'field_name' => $name,
      'entity_type' => 'paragraph',
      'type' => $def['type'],
      'cardinality' => 1,
    ])->save();
    print "storage: $name\n";
  }
}

$bundles = [
  'bs_event' => [
    'label' => 'BS Event',
    'description' => 'One card in the events carousel.',
    'fields' => [
      'field_heading' => ['Name', TRUE, ''],
      'field_category' => ['Category', FALSE, 'e.g. Festival, or a date label.'],
      'field_image' => ['Image', FALSE, ''],
      'field_attendees' => ['Attendees', FALSE, 'e.g. 40K'],
      'field_is_hot' => ['Hot', FALSE, 'Show the “hot” marker on the card.'],
      'field_body_text' => ['Description', FALSE, ''],
    ],
  ],
  'bs_events_carousel' => [
    'label' => 'BS Events Carousel',
    'description' => '3D auto-scrolling carousel of event cards.',
    'fields' => [
      'field_eyebrow' => ['Eyebrow', FALSE, 'Defaults to Timeline.'],
      'field_heading' => ['Heading', FALSE, 'Defaults to EVENTS.'],
      'field_items' => ['Events', TRUE, '', ['bs_event']],
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
      'boolean' => 'boolean_checkbox',
      default => 'string_textfield',
    };
    $form_display->setComponent($field_name, ['type' => $widget, 'weight' => $weight++]);
  }
  $form_display->save();
}

// Allow the carousel on node.page.field_paragraphs.
$field = FieldConfig::loadByName('node', 'page', 'field_paragraphs');
if ($field) {
  $settings = $field->getSetting('handler_settings');
  $settings['target_bundles']['bs_events_carousel'] = 'bs_events_carousel';
  $settings['target_bundles_drag_drop']['bs_events_carousel'] = ['enabled' => TRUE, 'weight' => 10];
  $field->setSetting('handler_settings', $settings);
  $field->save();
  print "node.page.field_paragraphs: bs_events_carousel enabled\n";
}

print "Done.\n";
