export default `
WITH updated_card AS (
  UPDATE
    cards
  SET
    front = $1,
    back = $2,
    hint = $3
  WHERE
    card_id = $4
  RETURNING
    card_id,
    front,
    back,
    hint
),
input_tags AS (
  SELECT
    u.tag,
    t.tag_id
  FROM (
    SELECT
      *
    FROM
      unnest($5::text[]) tag) u
  LEFT JOIN tags t ON u.tag = t.tag
),
insert_tags AS (
INSERT INTO tags (tag)
  SELECT
    tag
  FROM
    input_tags
  WHERE
    tag_id IS NULL
  RETURNING
    tag,
    tag_id
),
combined_tags AS (
  SELECT
    *
  FROM
    insert_tags
  UNION
  SELECT
    *
  FROM
    input_tags
  WHERE
    tag_id IS NOT NULL
),
insert_card_tags AS (
INSERT INTO card_tags (card_id, tag_id)
  SELECT
    $4,
    co.tag_id
  FROM
    combined_tags co
  LEFT JOIN card_tags ct ON co.tag_id = ct.tag_id
    AND ct.card_id = 3
WHERE
  ct.tag_id IS NULL
),
delete_card_tags AS (
  DELETE FROM card_tags ct1 USING card_tags ct2
  LEFT JOIN combined_tags co ON ct2.tag_id = co.tag_id
  WHERE ct1.card_id = 3
    AND ct1.card_id = ct2.card_id
    AND ct1.tag_id = ct2.tag_id
    AND co.tag_id IS NULL
)
SELECT
  card_id "cardId", front, back, hint, coalesce((
    SELECT
      array_agg(row_to_json(x))
      FROM (
        SELECT
          tag_id "tagId", tag FROM combined_tags
        ORDER BY
          tag_id) x), ARRAY[]::json[]) tags
FROM
  updated_card
`;
