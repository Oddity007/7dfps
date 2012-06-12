//
// Test Enemy Script
//


script.implements('enemy_base');
script.attachEvent(DIM3_EVENT_CONSTRUCT,"enemyConstruct");
script.attachEvent(DIM3_EVENT_SPAWN,"enemySpawn");

var fireBone = 1;
var shotsFired = -1;
var reloadWait = 2000;
var reloadTick = 0;

var summoned_enemies = false;
var summon_spot_name = "";
var summon_spots = new Array();

function enemyConstruct(obj,subEvent,id,tick) {
    script.callParent();
    obj.model.name = "Little Guy";
    obj.weapon.add("SecurityBot_Weapon");
    obj.health.maximum = 30;
    obj.health.start = 30;
}

function enemySpawn(obj,subEvent,id,tick) {
    script.callParent();
    summon_spot_name = obj.setting.getParameter(3);
    for (var i = 0; i < map.spot.count; i++) {
        if (map.spot.getName(i) == summon_spot_name) {
            summon_spots.push(i);
        }
    }
}

function enemyAttack(obj,tick) {
    obj.model.animation.change("Idle");
    obj.motionVector.stop();
    obj.motionVector.turnToPlayer();
    if (!summonEnemies()) {
        startFire(obj,tick);
    }
}

function summonEnemies(obj,tick) {
    if (summoned_enemies == true) return false;
    summoned_enemies = true;
    for (var i = 0; i < summon_spots.length; i++) {
        map.object.spawn(summon_spot_name,"security_bot",null,map.spot.getPosition(summon_spots[i]),map.spot.getAngle(summon_spots[i]));
    }
    return true;
}

function startFire(obj,tick) { // fires for a few seconds? randomly
    obj.model.animation.change("Idle"); // make sure we're not swiveling while aiming
    if (tick < reloadTick) return; //still reloading
    obj.motionVector.stop(); // stop movement to fire
    shotsFired += 1; // We just fired!
    if (shotsFired <= 0) return; // first "empty" shot to delay a bit
    reloadTick = parseInt(tick); // we didnt reload, so were fine here
    if (shotsFired > 6) { // you fired enough for now
        shotsFired = -1; // reset this
        reloadTick += reloadWait; // gotta reload
        return;
    }
    obj.weapon.fire("SecurityBot_Weapon",1); // BAM
    
    // Lights and Sounds
    spawn.particle(obj.model.bone.findPosition("Idle","Fire"+fireBone),"Muzzle Flash");
    sound.playAtObject("Gun Fire",obj.setting.id,1.0);
    
    // move through the fire bones
	fireBone += 1;
	if (fireBone > 3) fireBone = 1;
	
	// repeat
	obj.event.chain(1,"startFire");
}