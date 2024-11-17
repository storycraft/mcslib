execute store result score r1 __mcs_scoreboard run data get storage mcs:system registers.r1
execute store result score r2 __mcs_scoreboard run data get storage mcs:system registers.r2
scoreboard players operation r1 __mcs_scoreboard %= r2 __mcs_scoreboard
execute store result storage mcs:system registers.r1 double 1 run scoreboard players get r1 __mcs_scoreboard