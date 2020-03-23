WITH json_tags AS (
  SELECT
    x. "tagId",
    row_to_json(x) AS tag
  FROM (
    SELECT
      tag_id "tagId",
      tag
    FROM
      tags) x
),
tag_arrays AS (
  SELECT
    ct.card_id,
    array_agg(jt.tag) AS tags
  FROM
    card_tags ct
    INNER JOIN json_tags jt ON ct.tag_id = jt. "tagId"
  GROUP BY
    ct.card_id
)
SELECT
  c.card_id "cardId",
  c.front,
  c.back,
  c.hint,
  COALESCE(ta.tags, ARRAY[]::json[]) tags
FROM
  cards c
  LEFT JOIN tag_arrays ta ON ta.card_id = c.card_id
WHERE
  c.card_id = $1
LIMIT 1
