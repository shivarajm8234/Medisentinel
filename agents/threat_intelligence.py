import logging
import random
import time
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class ThreatIntelligenceAgent:
    def __init__(self):
        self.mock_ioc_feeds = [
            {"indicator": "192.168.1.105", "type": "ip", "source_feed": "AlienVault OTX"},
            {"indicator": "10.0.0.99", "type": "ip", "source_feed": "IBM X-Force"},
            {"indicator": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "type": "hash", "source_feed": "VirusTotal"},
            {"indicator": "malicious-c2.net", "type": "domain", "source_feed": "ThreatConnect"}
        ]
        self.last_ingest_time = 0

    def get_new_intel(self) -> List[Dict[str, Any]]:
        """
        Simulate polling external STIX/TAXII feeds for new IOCs.
        """
        current_time = time.time()
        # Simulate new intel every ~60 seconds
        if current_time - self.last_ingest_time > 60:
            self.last_ingest_time = current_time
            # Return 1-2 random IOCs
            num_to_pick = random.randint(1, 2)
            iocs = random.sample(self.mock_ioc_feeds, num_to_pick)
            for ioc in iocs:
                ioc["confidence"] = random.randint(60, 99)
                logger.info(f"ThreatIntelligence: Ingested new IOC: {ioc['indicator']} from {ioc['source_feed']}")
            return iocs
        return []
