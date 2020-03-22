WITH insert_card AS (
INSERT INTO cards (front, back, hint)
    VALUES ($1, $2, $3)
  RETURNING
    card_id, front, back, hint
), input_tags AS (
  SELECT
    u.tag,
    t.tag_id
  FROM (
    SELECT
      unnest($4::text[]) tag) u
  LEFT JOIN tags t ON t.tag = u.tag
),
insert_tags AS (
INSERT INTO tags (tag)
  SELECT
    it.tag
  FROM
    input_tags it
  WHERE
    it.tag_id IS NULL
  RETURNING
    tag,
    tag_id
),
combined_tags AS (
  SELECT
    inp.tag,
    inp.tag_id
  FROM
    input_tags inp
  WHERE
    inp.tag_id IS NOT NULL
  UNION
  SELECT
    ins.tag,
    ins.tag_id
  FROM
    insert_tags ins
),
insert_card_tags AS (
INSERT INTO card_tags (card_id, tag_id)
  SELECT
    ic.card_id,
    ct.tag_id
  FROM
    insert_card ic,
    combined_tags ct
)
SELECT
  ic.card_id "cardId",
  coalesce((
    SELECT
      array_agg(row_to_json(x))
    FROM (
      SELECT
        ct.tag, ct.tag_id "tagId" FROM combined_tags ct
      ORDER BY
        tag_id) x), ARRAY[]::json[]) tags
FROM
  insert_card ic
