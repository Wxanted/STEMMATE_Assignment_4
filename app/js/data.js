// Synthetic activity catalogue (no real learner data). 32 activities.
// Row: [title, level, ages, topic, minutes, materials[], costNAD, safety, steps[]]
const rows = [
["Simple Circuit Challenge","Intermediate","12-14","Electricity",45,["Battery","Bulb","Copper wire"],30,"Do not short-circuit the battery. Adult checks all connections.",["Connect battery, wire and bulb in a loop","Predict what happens if one wire is removed","Test and record the result","Add a second bulb and compare brightness"]],
["Water Conductivity Test","Intermediate","12-14","Electricity",45,["Battery","Bulb","Plastic bottle","Salt"],25,"Keep wires and battery away from open water containers.",["Fill two cups: plain water and salt water","Build a tester with battery and bulb","Test each cup and note the bulb","Explain why results differ"]],
["Marshmallow Towers","Beginner","7-12","Engineering",45,["Marshmallows","Dry spaghetti","Tape"],40,"Check for food allergies before handling food items.",["Form teams of three","Build the tallest free-standing tower in 15 minutes","Measure each tower","Discuss which shapes were strongest"]],
["Build a Bottle Rocket","Intermediate","9-12","Engineering",60,["Plastic bottle","Cardboard","Tape","Water"],20,"Launch outdoors only. Everyone stands behind the launch line.",["Fit fins made of cardboard to the bottle","Fill the bottle one third with water","Pump or press to launch outdoors","Compare distance for different water amounts"]],
["Maths in Motion","Intermediate","9-13","Mathematics",60,["Toy cars","Cardboard ramp","Tape measure","Stopwatch"],0,"Keep the floor clear of trip hazards around the ramp.",["Build a ramp and mark a start line","Predict which car travels farthest","Run three trials per car and record time and distance","Calculate averages and draw a bar chart"]],
["Code a Tiny Maze","Beginner","8-12","Technology",60,["Paper","Pencil","Counters"],0,"No special hazards. Keep pencils pointing down.",["Draw a grid maze on paper","Write directions as arrows","A partner follows the arrows with a counter","Fix any bug and try again"]],
["Paper Plane Distances","Beginner","7-10","Physics",30,["Paper","Tape measure"],0,"Throw away from faces. Do not throw towards others.",["Fold three different plane designs","Throw each design three times","Measure each distance","Pick the best design and explain why"]],
["Balloon Powered Car","Intermediate","9-13","Physics",45,["Balloons","Plastic bottle","Straws","Bottle caps"],25,"Check for latex allergies before using balloons.",["Build a car body from the bottle","Attach wheels made from bottle caps","Fix a balloon to a straw as engine","Race and measure distance"]],
["Egg Drop Protection","Intermediate","10-14","Engineering",60,["Eggs","Cardboard","Tape","Cotton wool"],45,"Drop only outdoors. Wash hands after handling eggs.",["Design a protective case","Drop from 1 metre","Inspect the egg","Improve the design and drop from 2 metres"]],
["Human Number Line","Beginner","6-9","Mathematics",30,["Chalk","Number cards"],5,"Play on a flat dry surface.",["Draw a line on the ground","Hand out number cards","Learners stand in order","Practise adding by stepping forward"]],
["Fraction Pizza","Beginner","8-11","Mathematics",30,["Paper plates","Scissors","Markers"],15,"Adult cuts with scissors for younger learners.",["Colour each plate to look like a pizza","Cut into halves, quarters, eighths","Compare piece sizes","Make a whole from mixed fractions"]],
["Magic Milk Colours","Beginner","7-10","Chemistry",30,["Milk","Food colouring","Dish soap","Plate"],35,"Do not drink the experiment liquids.",["Pour milk onto a plate","Add drops of food colouring","Touch soap to the milk","Describe what moves and why"]],
["Cabbage pH Indicator","Intermediate","11-14","Chemistry",60,["Red cabbage","Vinegar","Baking soda","Cups"],30,"Do not taste samples. Wash hands after the activity.",["Boil cabbage to make indicator liquid","Pour into cups","Add vinegar to one and baking soda to another","Record the colours and rank acidity"]],
["Growing Beans in a Bag","Beginner","7-11","Biology",30,["Beans","Cotton wool","Plastic bag","Water"],10,"Wash hands after touching soil or seeds.",["Wet the cotton wool","Place beans inside the bag","Tape the bag to a sunny window","Observe and draw each day"]],
["Leaf Detectives","Beginner","7-11","Biology",45,["Paper","Pencil","Magnifying glass"],10,"Do not eat or smell unknown plants.",["Collect fallen leaves","Make rubbings","Sort by shape and edge","Name the groups you made"]],
["Solar Oven S'mores","Intermediate","10-14","Physics",60,["Cardboard box","Foil","Plastic bag","Marshmallows"],50,"Surfaces get hot. Never look at reflected sunlight.",["Line the box with foil","Cover the opening with the bag","Place in direct sun","Measure how long it takes to warm food"]],
["Pinhole Camera","Intermediate","11-14","Physics",60,["Cardboard box","Foil","Tape","Tracing paper"],20,"Never point the camera at the sun.",["Make a pinhole in foil on one side","Fix tracing paper opposite","Point at a bright object","Describe the upside-down image"]],
["Straw Bridges","Beginner","8-12","Engineering",45,["Straws","Tape","Coins"],20,"Keep coins off the floor to avoid slips.",["Build a bridge between two desks","Add coins until it fails","Record the load","Rebuild stronger and retest"]],
["Spinning Wind Turbine","Advanced","12-16","Engineering",90,["Cardboard","Pencil","Pins","Straws"],25,"Pins are sharp. Adult supervises pin use.",["Cut and fold turbine blades","Pin to a straw axle","Blow or use a fan to spin it","Lift a small weight and compare blade designs"]],
["Lemon Battery","Advanced","12-16","Electricity",60,["Lemons","Copper coins","Nails","Copper wire"],40,"Do not eat the lemons after the experiment.",["Insert a coin and a nail into each lemon","Connect lemons in a series","Test with a small LED","Compare one lemon with three"]],
["Static Electricity Tricks","Beginner","8-11","Electricity",30,["Balloons","Paper","Wool cloth"],20,"Check for latex allergies before using balloons.",["Rub a balloon on the wool","Hold over paper scraps","Observe and record","Try different materials"]],
["Weather Station","Intermediate","10-14","Technology",90,["Plastic bottle","Thermometer","Paper","Pencil"],55,"Place instruments away from roads and open drops.",["Build a rain gauge from the bottle","Mount a thermometer in shade","Record readings daily for a week","Plot the results"]],
["Binary Bracelets","Beginner","8-12","Technology",45,["Beads","String"],30,"Small beads are a choking risk for young learners.",["Learn the binary code for letters","Choose initials","Thread beads to match the code","Swap bracelets and decode"]],
["Sorting Algorithm Dance","Intermediate","10-14","Technology",45,["Number cards","Chalk"],5,"Play on a flat dry surface with space to move.",["Give each learner a number card","Sort by swapping neighbours","Count the swaps","Try a faster strategy"]],
["Volume with Water","Intermediate","10-13","Mathematics",45,["Plastic bottle","Cups","Water","Markers"],0,"Wipe spills immediately to prevent slips.",["Mark equal steps on a bottle","Fill using a small cup","Count cups to fill the bottle","Compare volumes of different bottles"]],
["Fizzing Volcano","Beginner","7-11","Chemistry",30,["Vinegar","Baking soda","Plastic bottle","Tray"],25,"Wear eye protection. Do not taste the mixture.",["Build a clay cone around a bottle","Add baking soda","Pour in vinegar","Record what happens"]],
["Density Tower","Advanced","12-16","Chemistry",60,["Honey","Water","Oil","Tall glass"],60,"Do not drink. Clean spills immediately.",["Pour liquids in order of density","Drop small objects in","Record where each stops","Explain the layers"]],
["Seed Dispersal Design","Intermediate","9-13","Biology",45,["Paper","Paper clips","Tape"],5,"No special hazards.",["Study how maple seeds spin","Build a paper seed","Drop from a height","Compare designs for slowest fall"]],
["Habitat Shoebox","Beginner","7-10","Biology",60,["Shoebox","Paper","Clay","Markers"],20,"Adult cuts cardboard with scissors for younger learners.",["Choose an animal","Build its habitat inside the box","Label food, water, shelter","Present to the group"]],
["Bouncing Ball Heights","Intermediate","10-13","Physics",30,["Balls","Tape measure","Wall"],0,"Check that nobody stands in the bounce area.",["Mark heights on a wall","Drop each ball from a fixed height","Record the rebound","Graph the results"]],
["Compass Treasure Hunt","Advanced","12-16","Mathematics",90,["Compass","Paper","Tape measure"],20,"Stay within the marked field boundary.",["Plan a route with bearings","Hide markers","Another team follows the bearings","Compare planned and actual paths"]]
];

export const ACTIVITIES = rows.map((r, i) => ({
  id: "act-" + String(i + 1).padStart(2, "0"),
  title: r[0], level: r[1], ages: r[2], topic: r[3], minutes: r[4],
  materials: r[5], costNAD: r[6], safety: r[7], steps: r[8],
}));

export const TOPICS = [...new Set(ACTIVITIES.map(a => a.topic))].sort();
export const LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const MATERIALS = [...new Set(ACTIVITIES.flatMap(a => a.materials))].sort();

// PLACEHOLDER authentication accounts: synthetic only. The backend login (task 10) replaces this.
export const DEMO_ACCOUNTS = [
  { id: "u1", email: "facilitator1@example.org", password: "Demo-Pass-1", name: "Facilitator One" },
  { id: "u2", email: "facilitator2@example.org", password: "Demo-Pass-2", name: "Facilitator Two" },
];
