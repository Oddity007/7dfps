script.attachEvent(DIM3_EVENT_CONSTRUCT, 'OnConstruct');
script.attachEvent(DIM3_EVENT_SPAWN, 'OnSpawn');
script.attachEvent(DIM3_EVENT_DAMAGE, 'OnDamage');
script.attachEvent(DIM3_EVENT_HEALTH, 'OnHealthUpdate');
script.attachEvent(DIM3_EVENT_DIE, 'OnDeath');
script.attachEvent(DIM3_EVENT_PICKUP, 'OnPickup');
script.attachEvent(DIM3_EVENT_TIMER, "OnTimer")
script.attachEvent(DIM3_EVENT_MESSAGE, "OnMessage");
script.attachEvent(DIM3_EVENT_WEAPON_SELECT, "OnWeaponSelect");
script.attachEvent(DIM3_EVENT_WEAPON_FIRE, "OnWeaponFire");
script.attachEvent(DIM3_EVENT_HIT, "OnHit");

const LineOfSightTimerID = 1;
var Score = 0;

function Weapon(name)
{
	this.name=name;
}

var Weapons=new Array(3);
Weapons[0]=new Weapon("AssaultRifle"); //"This is my rifle!"
Weapons[1]=new Weapon("Shotgun"); //"This is my gun!"
Weapons[2]=new Weapon("ParticleBeamCannon"); //"This is for shooting!"
Weapons[3]=new Weapon("Nothing"); //"This is for fun!"

function OnConstruct(object, subevent, id, tick)
{
	object.model.on=false;
	//object.model.name="Player";
	object.model.shadow.on=false;
	
	object.size.x=2000;
	object.size.z=2000;	
	object.size.y=1600;
	object.size.eyeOffset=-1600;
	object.size.weight=180;
	
	object.setting.bumpUp=true;
	object.objectSpeed.bumpHeight=3000;
	
	object.click.crosshairUp="interact";
	//object.click.crosshairDown="Use";

	object.setting.singleSpeed = false;
	
	object.turnSpeed.facingWalk=4;
	object.turnSpeed.motionWalk=4;
	object.turnSpeed.facingRun=4.2;
	object.turnSpeed.motionRun=4.2;
	object.turnSpeed.facingCrawl=3;
	object.turnSpeed.motionCrawl=3;
	object.turnSpeed.facingAir=3;
	object.turnSpeed.motionAir=3;
	
	object.forwardSpeed.walk=75;
	object.forwardSpeed.run=75;
	object.forwardSpeed.crawl=25;
	object.forwardSpeed.air=50;
	object.forwardSpeed.acceleration=4;
	object.forwardSpeed.deceleration=8;
	object.forwardSpeed.accelerationAir=1.0;
	object.forwardSpeed.decelerationAir=0.5;
	
	object.sideSpeed.walk=object.forwardSpeed.walk;
	object.sideSpeed.run=object.forwardSpeed.run;
	object.sideSpeed.crawl=object.forwardSpeed.crawl;
	object.sideSpeed.air=object.forwardSpeed.air;
	object.sideSpeed.acceleration=object.forwardSpeed.acceleration;
	object.sideSpeed.deceleration=object.forwardSpeed.deceleration;
	object.sideSpeed.accelerationAir=object.forwardSpeed.accelerationAir;
	object.sideSpeed.decelerationAir=object.forwardSpeed.decelerationAir;

	object.verticalSpeed.normal=70;
	object.verticalSpeed.acceleration=20;
	object.verticalSpeed.deceleration=20;
	
	object.objectSpeed.jumpHeight=45;
	object.objectSpeed.bumpHeight=800;
	object.objectSpeed.duckAdd=100;
	object.objectSpeed.duckChange=600;
	
	object.look.upAngle=90;
	object.look.downAngle=90;
	
	object.health.maximum=100;
	object.health.start=100;
	object.health.recoverTick=0;
	object.health.recoverAmount=0;
	
	object.setting.ignorePickUpItems=false;
	object.setting.damage=true;
	object.setting.invincible=false;
	
	for(var i = 0; i < Weapons.length; i++)
	{
		object.weapon.add(Weapons[i].name);
		object.weapon.hideSingle(Weapons[i].name, true);
	}
	object.weapon.hideSingle(Weapons[3].name, false);

	//object.weapon.add("LineOfSight");
	//object.weapon.hideSingle("LineOfSight", true);
	
	object.model.light.index=0;
	object.model.light.on=false;
	object.model.light.intensity=5000;
	object.model.lightColor.red=1;
	object.model.lightColor.green=0.3;
	object.model.lightColor.blue=0.3;
	
   // object.setting.contactProjectile=false;
   
   	/*for(var i = 0; i < Weapons.length; i++)
	{
		object.weapon.hideSingle(Weapons[i].name, true);
	}
	object.weapon.hideSingle(Weapons[3].name, false);*/
	object.weapon.setSelect(Weapons[3].name);

	Score = 0;
}

function OnSpawn(object, subevent, id, tick)
{
	object.size.eyeOffset=-1600;
	object.setting.contact=true;
	object.setting.suspend=false;
	object.health.reset();
	object.position.reset();

	//iface.bitmap.setAlpha("Blood", 1-(object.health.current/object.health.maximum));
	//iface.text.setText("AmmoTextbox"," ");

	//object.event.startTimer(10, LineOfSightTimerID);

	camera.plane.near = 100;
	camera.plane.far = 1000000;

	object.weapon.hide(false);

	object.setting.damage=true;
	object.setting.contact=true;
	
	object.status.freezeInput(false);

	iface.text.hide("DeathInfo");

	switch(subevent)
	{
		case DIM3_EVENT_SPAWN_MAP_CHANGE:
			break;
		case DIM3_EVENT_SPAWN_INIT:
		case DIM3_EVENT_SPAWN_REBORN:
		case DIM3_EVENT_SPANW_GAME_RESET:
			for(var i = 0; i < Weapons.length; i++)
			{
				object.weapon.hideSingle(Weapons[i].name, true);
			}
			object.weapon.hideSingle(Weapons[3].name, false);
			object.weapon.setSelect(Weapons[3].name);
			break;
	}

	UpdateWeaponDisplay(object);
	OnHealthUpdate(object, subevent, id, tick);
}

function OnDamage(object, subevent, id, tick)
{
	object.status.tintView(new Color(1, 0, 0), 0.5, 20, 100, 20);
	OnHealthUpdate(object, subevent, id, tick);
}

function OnHealthUpdate(object, subevent, id, tick)
{
	if(object.health.maximum > 0) iface.bar.setValue('Health', (object.health.current/object.health.maximum));
	if(object.health.armorMaximum > 0) iface.bar.setValue('Armor', (object.health.armorCurrent/object.health.armorMaximum));
	else iface.bar.setValue('Armor', 0);
}

var NextMap = null;

function DisplayScore(object, nextMapName, isDead)
{
	object.event.clearTimer();
	//map.action.restartMap();

	object.weapon.hide(true);
	//iface.bar.hide('Health');
	
		// freeze all input and lock off player
		
	object.setting.damage=false;
	object.setting.contact=false;
	
	object.motionVector.stop();
	object.motionAngle.turnStop();
	
	object.status.freezeInput(true);

		// death is seen from above
		
	//camera.setting.type=DIM3_CAMERA_TYPE_CHASE_STATIC;
		
	//camera.chase.trackAngle.y=270;
	//camera.chase.distance=8000;
	
		// death scream
		
	//sound.playAtObject("Scream",obj.setting.id,utility.random.getFloat(0.4,0.5));
	
		// death animation
		
	//obj.model.animation.stopAll();
	//obj.model.animation.start('Die');
	
		// don't let respawn happen while we are dying
		


	object.status.freezeRespawn(true);

	iface.text.show("DeathInfo");
	var time = map.setting.getTime()/1000;
	iface.text.setText("DeathInfo", (isDead ? "You Died." : "You Cleared.") + " Score: " + Score + " Time: " + time + " seconds");
	var dateString = (new Date()).toDateString();
	singleplayer.highScore.add("Score " + map.info.title + " " + dateString, Score);
	singleplayer.highScore.add("Time " + map.info.title + " " + dateString, time);

	Score = 0;

	NextMap = (isDead ? null : nextMapName);

	//if(isDead) object.event.chain(50,'playerDieEnd');
	//else 
	object.event.chain(50, "StartNextMap");
}

function StartNextMap(object)
{
	object.status.freezeRespawn(false);
	iface.text.hide("DeathInfo");
	//NextMap
	if(NextMap == null) map.action.restartMap();
	else map.action.setMap(NextMap,'Start');
}

function OnDeath(object, subevent, id, tick)
{
	OnHealthUpdate(object, subevent, id, tick);
	DisplayScore(object, null, true);
}
/*
function playerDieEnd(obj,tick)
{

		// let player respawn
		
	//camera.setting.type=DIM3_CAMERA_TYPE_FPP;
		
	//camera.chase.trackAngle.y=270;
	//camera.chase.distance=8000;

	obj.status.freezeRespawn(false);
	iface.text.hide("DeathInfo");
	//data.set(ScoreHandle, 0);

	map.action.restartMap();
}*/

function OnPickup(object, subevent, id, tick)
{
	if(!object.pickup.itemName) return;
	//object.weapon.setSelect(object.pickup.itemName);
	OnHealthUpdate(object, subevent, id, tick);
	UpdateWeaponDisplay(object);
}

function OnTimer(object, subevent, id, tick)
{
	if(id == LineOfSightTimerID) 
	{
		//object.weapon.fire("LineOfSight", 0);
		//iface.console.write("Timer Fired After " + tick + " Ticks");
	}
}

const ReloadKeyID = 4;
/*
const SprintKeyID = 5;

var ForwardSpeedBackup = null;
var SideSpeedBackup = null;
var IsSprinting = false;

function StartSprinting(object)
{
	if(IsSprinting) return;
	IsSprinting = true;
	ForwardSpeedBackup = object.forwardSpeed.walk;
	SideSpeedBackup = object.sideSpeed.walk;
	object.forwardSpeed.walk = 100;
	object.sideSpeed.walk = 100;
	object.event.chain(50, "EndSprinting");
}

function EndSprinting(object)
{
	if(IsSprinting == false) return;
	IsSprinting = false;
	object.forwardSpeed.walk = ForwardSpeedBackup;
	object.sideSpeed.walk = SideSpeedBackup;
	SideSpeedBackup = null;
	ForwardSpeedBackup = null;
}*/

function OnKeyDown(object, id)
{
	switch (id)
	{
		case ReloadKeyID://Reload
			//object.event.callHeldWeapon("OnManualReload");
			//UpdateWeaponDisplay(object);
			break;
		//case SprintKeyID://Sprint
		//	StartSprinting(object);
		//	break;
	}
}

function OnKeyUp(object, id)
{
	switch (id)
	{
		//case SprintKeyID://Sprint
		//	EndSprinting(object);
		//	break;
	}
}

function OnMessage(object, subevent, id, tick)
{
	switch (subevent)
	{
		case DIM3_EVENT_MESSAGE_FROM_KEY_DOWN:
			OnKeyDown(object, id);
			break
		case DIM3_EVENT_MESSAGE_FROM_KEY_UP:
			OnKeyUp(object, id);
			break;
	}
}

function UpdateWeaponDisplay(object)
{
	var selectedWeaponName = object.weapon.getSelect();
	var weaponInfoText = "";
	if(selectedWeaponName == null) return;

	weaponInfoText += selectedWeaponName;
	weaponInfoText += " (";
	weaponInfoText += object.weapon.getAmmoCount(selectedWeaponName);
	weaponInfoText += " rounds)";
	//weaponInfoText += object.weapon.getClipCount(selectedWeaponName);
	//weaponInfoText += " clips)";

	iface.text.setText("WeaponInfo", weaponInfoText);
}

function OnWeaponSelect(object, subevent, id, tick)
{
	UpdateWeaponDisplay(object);
}

function OnWeaponFire(object, subevent, id, tick)
{
	UpdateWeaponDisplay(object);
}

function AddPointsToScore(object, amount)
{
	Score += amount;
}

function OnHit(object, subevent, id, tick)
{
	//if(object.hit.objectId == -1) return;
	Score -= object.hit.damage;
}

function DisplayScoreThenStartMap(object, mapname)
{
	iface.text.show("DeathInfo");
	var time = map.setting.getTime()/1000;
	iface.text.setText("DeathInfo", "You Died. Score: " + Score + " Time: " + time + " seconds");
	var dateString = (new Date()).toDateString();
	singleplayer.highScore.add("Score " + map.info.title + " " + dateString, Score);
	singleplayer.highScore.add("Time " + map.info.title + " " + dateString, time);
}

function DisplayScoreWon()
{
	iface.text.show("DeathInfo");
	var time = map.setting.getTime()/1000;
	iface.text.setText("DeathInfo", "You Won. Score: " + Score + " Time: " + time + " seconds");
	var dateString = (new Date()).toDateString();
	singleplayer.highScore.add("Score " + map.info.title + " " + dateString, Score);
	singleplayer.highScore.add("Time " + map.info.title + " " + dateString, time);
}