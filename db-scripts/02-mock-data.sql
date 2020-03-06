INSERT INTO cards (front, back, hint) VALUES 
('1.front', '1.back', '1.hint'),
('2.front', '2.back', '2.hint'),
('3.front', '3.back', '3.hint'),
('4.front', '4.back', '4.hint'),
('5.front', '5.back', '5.hint'),
('6.front', '6.back', '6.hint');

INSERT INTO tags (tag) VALUES
('1.tag'),
('2.tag'),
('3.tag');

INSERT INTO card_tags (card_id, tag_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 1),
(2, 2),
(2, 3),
(3, 1),
(3, 2),
(4, 1),
(4, 2),
(5, 2),
(5, 3),
(6, 3);


INSERT INTO categories (name) VALUES ('1.category'),('2.category');

INSERT INTO category_tags (category_id, tag_id) VALUES 
(1, 1),
(1, 2),
(2, 2),
(2, 3);