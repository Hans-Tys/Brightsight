<?php

/**
 * @file
 * Adds the bs_light_console paragraph type for the light-console SDC.
 *
 * Run with: ddev drush scr scripts/create_light_console_paragraph.php
 * Idempotent — existing types/fields are left untouched.
 */

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\paragraphs\Entity\ParagraphsType;

$id = 'bs_light_console';

if (!ParagraphsType::load($id)) {
  ParagraphsType::create([
    'id' => $id,
    'label' => 'BS Light Console',
    'description' => 'Interactive grandMA3-style light table: faders and buttons drive colored beams on a stage.',
  ])->save();
  print "bundle: $id\n";
}

// [storage field, label, required, description]
$fields = [
  'field_eyebrow' => ['Eyebrow', FALSE, 'Defaults to HANDS ON.'],
  'field_heading' => ['Heading (light part)', FALSE, 'e.g. TRY THE'],
  'field_heading_accent' => ['Heading (accent part)', FALSE, 'e.g. CONSOLE'],
  'field_value' => ['Number of fixtures', FALSE, 'Light beams / fader channels, 2–8. Defaults to 6.'],
  'field_tags' => ['Color palette', FALSE, 'Hex colors the swatch buttons cycle through, one per value, e.g. #ff9500. Leave empty for the default palette.'],
];

$display_repository = \Drupal::service('entity_display.repository');
$form_display = $display_repository->getFormDisplay('paragraph', $id);
$weight = 0;

foreach ($fields as $field_name => [$label, $required, $description]) {
  if (!FieldConfig::loadByName('paragraph', $id, $field_name)) {
    FieldConfig::create([
      'field_name' => $field_name,
      'entity_type' => 'paragraph',
      'bundle' => $id,
      'label' => $label,
      'required' => $required,
      'description' => $description,
    ])->save();
    print "  field: $id.$field_name\n";
  }
  $storage = FieldStorageConfig::loadByName('paragraph', $field_name);
  $widget = $storage->getType() === 'integer' ? 'number' : 'string_textfield';
  $form_display->setComponent($field_name, ['type' => $widget, 'weight' => $weight++]);
}
$form_display->save();

// Allow on node.page.field_paragraphs.
$field = FieldConfig::loadByName('node', 'page', 'field_paragraphs');
if ($field) {
  $settings = $field->getSetting('handler_settings');
  $settings['target_bundles'][$id] = $id;
  $settings['target_bundles_drag_drop'][$id] = ['enabled' => TRUE, 'weight' => 10];
  $field->setSetting('handler_settings', $settings);
  $field->save();
  print "node.page.field_paragraphs: $id enabled\n";
}

print "Done.\n";
