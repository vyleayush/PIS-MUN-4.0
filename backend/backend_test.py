import requests
import sys
from datetime import datetime

BASE_URL = "https://paramount-mun.preview.emergentagent.com/api"
ADMIN_EMAIL = "paramountinternationalmun.26@gmail.com"
ADMIN_PASSWORD = "Mun091026@"
REFERRAL_CODE = "PARAMOUNT500"

class APITester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.test_reg_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{BASE_URL}{endpoint}"
        h = {'Content-Type': 'application/json'}
        if headers:
            h.update(headers)
        if self.admin_token and not headers:
            h['Authorization'] = f'Bearer {self.admin_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=h, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=h, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=h, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except Exception:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.text[:200]}")
                except Exception:
                    pass
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_committees_list(self):
        """Test GET /api/committees returns 5 committees with counts"""
        success, data = self.run_test(
            "GET /api/committees (5 committees with counts)",
            "GET",
            "/committees",
            200
        )
        if success and isinstance(data, list):
            print(f"   Found {len(data)} committees")
            if len(data) == 5:
                print("   ✓ Correct count (5)")
                # Check each committee has required fields
                for c in data:
                    if 'slug' in c and 'name' in c and 'open_count' in c and 'total_count' in c:
                        print(f"   ✓ {c['name']}: {c['open_count']}/{c['total_count']} open")
                    else:
                        print(f"   ⚠ Missing fields in committee: {c.get('name', 'unknown')}")
                return True
            else:
                print(f"   ⚠ Expected 5 committees, got {len(data)}")
        return False

    def test_committee_detail(self, slug):
        """Test GET /api/committees/{slug} returns full detail"""
        success, data = self.run_test(
            f"GET /api/committees/{slug} (full detail)",
            "GET",
            f"/committees/{slug}",
            200
        )
        if success:
            required = ['slug', 'name', 'full_name', 'agenda', 'chair', 'eb', 'difficulty', 'portfolios', 'open_count', 'total_count']
            missing = [f for f in required if f not in data]
            if not missing:
                print(f"   ✓ All required fields present")
                print(f"   ✓ Agenda: {data['agenda'][:60]}...")
                print(f"   ✓ Chair: {data['chair']}, EB: {data['eb']}, Difficulty: {data['difficulty']}")
                print(f"   ✓ Portfolios: {len(data['portfolios'])} total")
                return True
            else:
                print(f"   ⚠ Missing fields: {missing}")
        return False

    def test_referral_valid(self):
        """Test POST /api/referral/validate with valid code"""
        success, data = self.run_test(
            f"POST /api/referral/validate (valid code: {REFERRAL_CODE})",
            "POST",
            "/referral/validate",
            200,
            data={"code": REFERRAL_CODE}
        )
        if success and data.get('valid') == True:
            print(f"   ✓ Code validated successfully")
            if 'label' in data:
                print(f"   ✓ Label: {data['label']}")
            return True
        else:
            print(f"   ⚠ Expected valid=true, got: {data}")
        return False

    def test_referral_invalid(self):
        """Test POST /api/referral/validate with invalid code"""
        success, data = self.run_test(
            "POST /api/referral/validate (invalid code)",
            "POST",
            "/referral/validate",
            200,
            data={"code": "FAKECODE123"}
        )
        if success and data.get('valid') == False:
            print(f"   ✓ Invalid code correctly rejected")
            return True
        else:
            print(f"   ⚠ Expected valid=false, got: {data}")
        return False

    def test_registration_with_referral(self):
        """Test POST /api/registrations with referral code, id_card, and THREE preferences"""
        timestamp = datetime.now().strftime('%H%M%S')
        # Simple base64 test image (1x1 red pixel PNG)
        test_id_card = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        payload = {
            "full_name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "phone": "+91 9876543210",
            "school": "Test School",
            "city": "Test City",
            "experience": "First-timer",
            "awards": "",
            "is_delegation": False,
            "delegation_size": None,
            "heard_from": "",
            "preference1": {"committee": "UNGA", "portfolio": ""},
            "preference2": {"committee": "WHO", "portfolio": ""},
            "preference3": {"committee": "AIPPM", "portfolio": ""},
            "referral_code": REFERRAL_CODE,
            "id_card": test_id_card,
            "accepted_terms": True
        }
        success, data = self.run_test(
            f"POST /api/registrations (with referral {REFERRAL_CODE} + id_card + 3 preferences)",
            "POST",
            "/registrations",
            200,
            data=payload
        )
        if success:
            if data.get('ok') and data.get('reference_id'):
                print(f"   ✓ Registration created: {data['reference_id']}")
                print(f"   ✓ Email status: {data.get('email_status', {})}")
                print(f"   ✓ ID card included in payload")
                self.test_reg_id = data['reference_id']
                # Now verify the fee is 1500 (2000 - 500) and id_card is stored
                # We'll check this in admin endpoint later
                return True
            else:
                print(f"   ⚠ Missing ok or reference_id in response: {data}")
        return False

    def test_registration_without_referral(self):
        """Test POST /api/registrations without referral code and THREE preferences"""
        timestamp = datetime.now().strftime('%H%M%S')
        payload = {
            "full_name": f"Test User No Ref {timestamp}",
            "email": f"testnoref{timestamp}@example.com",
            "phone": "+91 9876543211",
            "school": "Test School 2",
            "city": "Test City 2",
            "experience": "1–2 conferences",
            "awards": "",
            "is_delegation": False,
            "delegation_size": None,
            "heard_from": "",
            "preference1": {"committee": "AIPPM", "portfolio": ""},
            "preference2": {"committee": "UNCSW", "portfolio": ""},
            "preference3": {"committee": "UNHRC", "portfolio": ""},
            "referral_code": "",
            "accepted_terms": True
        }
        success, data = self.run_test(
            "POST /api/registrations (without referral + 3 preferences)",
            "POST",
            "/registrations",
            200,
            data=payload
        )
        if success and data.get('ok') and data.get('reference_id'):
            print(f"   ✓ Registration created: {data['reference_id']}")
            return True
        return False

    def test_registration_no_terms(self):
        """Test POST /api/registrations with accepted_terms=false"""
        timestamp = datetime.now().strftime('%H%M%S')
        payload = {
            "full_name": f"Test User No Terms {timestamp}",
            "email": f"testnoterms{timestamp}@example.com",
            "phone": "+91 9876543212",
            "school": "Test School 3",
            "city": "Test City 3",
            "experience": "First-timer",
            "awards": "",
            "is_delegation": False,
            "delegation_size": None,
            "heard_from": "",
            "preference1": {"committee": "WHO", "portfolio": ""},
            "preference2": {"committee": "UNHRC", "portfolio": ""},
            "preference3": {"committee": "UNGA", "portfolio": ""},
            "referral_code": "",
            "accepted_terms": False
        }
        success, data = self.run_test(
            "POST /api/registrations (accepted_terms=false, expect 400)",
            "POST",
            "/registrations",
            400,
            data=payload
        )
        if success:
            print(f"   ✓ Correctly rejected registration without terms")
            return True
        return False

    def test_admin_login_correct(self):
        """Test POST /api/admin/login with correct credentials"""
        success, data = self.run_test(
            "POST /api/admin/login (correct credentials)",
            "POST",
            "/admin/login",
            200,
            data={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            headers={}  # No auth header for login
        )
        if success and data.get('token'):
            print(f"   ✓ Token received")
            self.admin_token = data['token']
            return True
        else:
            print(f"   ⚠ No token in response: {data}")
        return False

    def test_admin_login_wrong(self):
        """Test POST /api/admin/login with wrong credentials"""
        success, data = self.run_test(
            "POST /api/admin/login (wrong credentials, expect 401)",
            "POST",
            "/admin/login",
            401,
            data={"email": ADMIN_EMAIL, "password": "wrongpassword"},
            headers={}
        )
        if success:
            print(f"   ✓ Correctly rejected wrong credentials")
            return True
        return False

    def test_admin_stats(self):
        """Test GET /api/admin/stats (requires auth)"""
        success, data = self.run_test(
            "GET /api/admin/stats (with token)",
            "GET",
            "/admin/stats",
            200
        )
        if success:
            required = ['total', 'pending', 'verified', 'rejected']
            if all(k in data for k in required):
                print(f"   ✓ Stats: total={data['total']}, pending={data['pending']}, verified={data['verified']}, rejected={data['rejected']}")
                return True
            else:
                print(f"   ⚠ Missing fields in stats: {data}")
        return False

    def test_admin_stats_no_auth(self):
        """Test GET /api/admin/stats without auth (expect 401)"""
        # Temporarily remove token
        temp_token = self.admin_token
        self.admin_token = None
        success, data = self.run_test(
            "GET /api/admin/stats (no token, expect 401)",
            "GET",
            "/admin/stats",
            401
        )
        self.admin_token = temp_token
        if success:
            print(f"   ✓ Correctly rejected request without auth")
            return True
        return False

    def test_admin_registrations(self):
        """Test GET /api/admin/registrations and verify preference3 and id_card are stored"""
        success, data = self.run_test(
            "GET /api/admin/registrations",
            "GET",
            "/admin/registrations",
            200
        )
        if success and isinstance(data, list):
            print(f"   ✓ Found {len(data)} registrations")
            # Check if our test registration is there
            if self.test_reg_id:
                test_reg = next((r for r in data if r.get('reference_id') == self.test_reg_id), None)
                if test_reg:
                    print(f"   ✓ Found our test registration: {self.test_reg_id}")
                    print(f"   ✓ Fee: ₹{test_reg.get('fee')} (tier: {test_reg.get('fee_tier')})")
                    if test_reg.get('fee') == 1500 and 'referral' in test_reg.get('fee_tier', '').lower():
                        print(f"   ✓ Referral discount applied correctly (₹1500)")
                    else:
                        print(f"   ⚠ Expected fee=1500 with referral tier, got fee={test_reg.get('fee')}, tier={test_reg.get('fee_tier')}")
                    
                    # CRITICAL: Verify preference3 is stored
                    pref3 = test_reg.get('preference3')
                    if pref3:
                        print(f"   ✓ preference3 stored: {pref3.get('committee')} - {pref3.get('portfolio') or 'Any'}")
                    else:
                        print(f"   ❌ preference3 NOT found in stored registration!")
                        return False
                    
                    # NEW: Verify id_card is stored
                    id_card = test_reg.get('id_card')
                    if id_card:
                        print(f"   ✓ id_card stored (length: {len(id_card)} chars)")
                        if id_card.startswith('data:image'):
                            print(f"   ✓ id_card is valid base64 image data")
                        else:
                            print(f"   ⚠ id_card doesn't look like base64 image: {id_card[:50]}...")
                    else:
                        print(f"   ❌ id_card NOT found in stored registration!")
                        return False
            return True
        return False

    def test_admin_update_registration(self):
        """Test PATCH /api/admin/registrations/{id}"""
        if not self.test_reg_id:
            print("   ⚠ Skipping - no test registration ID")
            return False
        
        # First get the registration to find its ID
        success, regs = self.run_test(
            "GET /api/admin/registrations (to find test reg)",
            "GET",
            "/admin/registrations",
            200
        )
        if not success:
            return False
        
        test_reg = next((r for r in regs if r.get('reference_id') == self.test_reg_id), None)
        if not test_reg:
            print(f"   ⚠ Could not find test registration {self.test_reg_id}")
            return False
        
        reg_id = test_reg.get('id')
        success, data = self.run_test(
            f"PATCH /api/admin/registrations/{reg_id} (set verified)",
            "PATCH",
            f"/admin/registrations/{reg_id}",
            200,
            data={"payment_status": "verified"}
        )
        if success and data.get('payment_status') == 'verified':
            print(f"   ✓ Status updated to verified")
            return True
        return False

    def test_admin_committees(self):
        """Test GET /api/admin/committees"""
        success, data = self.run_test(
            "GET /api/admin/committees",
            "GET",
            "/admin/committees",
            200
        )
        if success and isinstance(data, list) and len(data) == 5:
            print(f"   ✓ Found {len(data)} committees")
            return True
        return False

    def test_admin_update_committee(self):
        """Test PATCH /api/admin/committees/{slug}"""
        success, data = self.run_test(
            "PATCH /api/admin/committees/unga (update chair)",
            "PATCH",
            "/admin/committees/unga",
            200,
            data={"chair": "Test Chair"}
        )
        if success and data.get('chair') == 'Test Chair':
            print(f"   ✓ Chair updated successfully")
            return True
        return False

    def test_admin_update_portfolio(self):
        """Test PATCH /api/admin/committees/{slug}/portfolios"""
        # First get UNGA to find a portfolio
        success, data = self.run_test(
            "GET /api/committees/unga (to find portfolio)",
            "GET",
            "/committees/unga",
            200
        )
        if not success or not data.get('portfolios'):
            return False
        
        portfolio = data['portfolios'][0]
        success, data = self.run_test(
            f"PATCH /api/admin/committees/unga/portfolios (set reserved)",
            "PATCH",
            "/admin/committees/unga/portfolios",
            200,
            data={"name": portfolio['name'], "status": "reserved", "delegate": "Test Delegate"}
        )
        if success:
            print(f"   ✓ Portfolio status updated")
            # Check if open_count decreased
            if 'open_count' in data:
                print(f"   ✓ Open count updated: {data['open_count']}")
            return True
        return False

    def test_admin_referral_codes(self):
        """Test GET /api/admin/referral-codes"""
        success, data = self.run_test(
            "GET /api/admin/referral-codes",
            "GET",
            "/admin/referral-codes",
            200
        )
        if success and isinstance(data, list):
            print(f"   ✓ Found {len(data)} referral codes")
            # Check if PARAMOUNT500 exists
            paramount = next((c for c in data if c.get('code') == REFERRAL_CODE), None)
            if paramount:
                print(f"   ✓ Found {REFERRAL_CODE}: discount=₹{paramount.get('discount')}, active={paramount.get('active')}")
            return True
        return False

    def test_admin_login_hacker(self):
        """Test POST /api/admin/login with hacker email (expect 401)"""
        success, data = self.run_test(
            "POST /api/admin/login (hacker@test.com, expect 401)",
            "POST",
            "/admin/login",
            401,
            data={"email": "hacker@test.com", "password": "anypassword"},
            headers={}
        )
        if success:
            print(f"   ✓ Correctly rejected hacker email")
            return True
        return False

    def test_allotment_hides_portfolio(self):
        """CORE TEST: Set India to allotted, verify it's hidden and open_count reduced, then reset"""
        print("\n" + "=" * 60)
        print("CORE TEST: ALLOTMENT HIDES PORTFOLIO")
        print("=" * 60)
        
        # Step 1: Get current UNGA state
        success, unga_before = self.run_test(
            "GET /api/committees/unga (before allotment)",
            "GET",
            "/committees/unga",
            200
        )
        if not success:
            print("   ❌ Failed to get UNGA initial state")
            return False
        
        open_count_before = unga_before.get('open_count')
        total_count = unga_before.get('total_count')
        print(f"   ✓ Initial state: {open_count_before}/{total_count} open")
        
        # Find India portfolio
        india = next((p for p in unga_before.get('portfolios', []) if p['name'] == 'India'), None)
        if not india:
            print("   ❌ India portfolio not found in UNGA")
            return False
        
        india_status_before = india.get('status')
        print(f"   ✓ India status before: {india_status_before}")
        
        # Step 2: Set India to allotted
        success, unga_allotted = self.run_test(
            "PATCH /api/admin/committees/unga/portfolios (set India to allotted)",
            "PATCH",
            "/admin/committees/unga/portfolios",
            200,
            data={"name": "India", "status": "allotted", "delegate": "Test Delegate"}
        )
        if not success:
            print("   ❌ Failed to set India to allotted")
            return False
        
        # Step 3: Verify India is allotted and open_count reduced
        india_after = next((p for p in unga_allotted.get('portfolios', []) if p['name'] == 'India'), None)
        if not india_after:
            print("   ❌ India portfolio not found after allotment")
            return False
        
        if india_after.get('status') != 'allotted':
            print(f"   ❌ India status should be 'allotted', got: {india_after.get('status')}")
            return False
        
        print(f"   ✓ India status after: allotted")
        
        open_count_after = unga_allotted.get('open_count')
        expected_open_count = open_count_before - 1 if india_status_before == 'available' else open_count_before
        
        if open_count_after == expected_open_count:
            print(f"   ✓ Open count reduced correctly: {open_count_before} → {open_count_after}")
        else:
            print(f"   ❌ Open count mismatch: expected {expected_open_count}, got {open_count_after}")
            return False
        
        # Step 4: Verify India is NOT in available portfolios (frontend filter test)
        available_portfolios = [p for p in unga_allotted.get('portfolios', []) if p.get('status') == 'available']
        india_in_available = any(p['name'] == 'India' for p in available_portfolios)
        
        if india_in_available:
            print(f"   ❌ India should NOT be in available portfolios, but it is!")
            return False
        else:
            print(f"   ✓ India correctly NOT in available portfolios (would be hidden in frontend)")
        
        # Step 5: Reset India back to available
        success, unga_reset = self.run_test(
            "PATCH /api/admin/committees/unga/portfolios (reset India to available)",
            "PATCH",
            "/admin/committees/unga/portfolios",
            200,
            data={"name": "India", "status": "available", "delegate": None}
        )
        if not success:
            print("   ❌ Failed to reset India to available")
            return False
        
        india_reset = next((p for p in unga_reset.get('portfolios', []) if p['name'] == 'India'), None)
        if india_reset and india_reset.get('status') == 'available':
            print(f"   ✓ India reset to available successfully")
            print(f"   ✓ Open count after reset: {unga_reset.get('open_count')}")
            return True
        else:
            print(f"   ❌ Failed to verify India reset")
            return False

def main():
    tester = APITester()
    
    print("=" * 60)
    print("PARAMOUNT MUN BACKEND API TESTS")
    print("=" * 60)
    
    # Public endpoints
    print("\n" + "=" * 60)
    print("PUBLIC ENDPOINTS")
    print("=" * 60)
    
    tester.test_committees_list()
    tester.test_committee_detail("unga")
    tester.test_committee_detail("aippm")
    tester.test_committee_detail("who")
    tester.test_committee_detail("uncsw")
    tester.test_committee_detail("unhrc")
    
    tester.test_referral_valid()
    tester.test_referral_invalid()
    
    tester.test_registration_with_referral()
    tester.test_registration_without_referral()
    tester.test_registration_no_terms()
    
    # Admin endpoints
    print("\n" + "=" * 60)
    print("ADMIN ENDPOINTS")
    print("=" * 60)
    
    tester.test_admin_login_wrong()
    tester.test_admin_login_hacker()
    tester.test_admin_login_correct()
    
    if tester.admin_token:
        tester.test_admin_stats_no_auth()
        tester.test_admin_stats()
        tester.test_admin_registrations()
        tester.test_admin_update_registration()
        tester.test_admin_committees()
        tester.test_admin_update_committee()
        tester.test_admin_update_portfolio()
        tester.test_admin_referral_codes()
        
        # CORE TEST: Allotment hides portfolio
        tester.test_allotment_hides_portfolio()
    else:
        print("\n⚠ Skipping admin tests - no token obtained")
    
    # Print results
    print("\n" + "=" * 60)
    print("TEST RESULTS")
    print("=" * 60)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    print("=" * 60)
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
