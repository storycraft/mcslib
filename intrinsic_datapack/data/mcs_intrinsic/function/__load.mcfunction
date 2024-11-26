# d9ac4c86-54af-44f9-95f5-f749e76b5aed item_display for multiplication
execute unless entity d9ac4c86-54af-44f9-95f5-f749e76b5aed run summon minecraft:item_display 0 999999 0 {UUID: [I;-643019642,1420772601,-1779042487,-412394771]}
# d1f136b6-da69-4a75-a602-3f9308ecfbda marker for addition
execute unless entity d1f136b6-da69-4a75-a602-3f9308ecfbda run summon minecraft:marker 0 999999 0 {UUID: [I;-772720970,-630633867,-1509802093,149748698]}
scoreboard objectives add __mcs_scoreboard dummy
execute unless data storage mcs:system locals run data modify storage mcs:system locals set value []
execute unless data storage mcs:system arguments run data modify storage mcs:system arguments set value []
execute unless data storage mcs:system registers run data modify storage mcs:system registers set value { r1: 0.0d, r2: 0.0d }